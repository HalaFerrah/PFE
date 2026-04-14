const db = require('../db');

// ── Coefficients durée ────────────────────────────────────────
const COEFF_DUREE = { '3_months': 0.35, '6_months': 0.60, '1_year': 1.00 };

// ── Table taux 34141A (depuis Excel) ─────────────────────────
const TAUX_34141A = {
  '1-1-1':1.7,'1-2-1':1.6,'1-3-1':1.6,'1-4-1':1.5,
  '2-1-1':1.6,'2-2-1':1.5,'2-3-1':1.5,'2-4-1':1.4,
  '3-1-1':1.5,'3-2-1':1.4,'3-3-1':1.4,'3-4-1':1.3,
  '4-1-1':1.4,'4-2-1':1.3,'4-3-1':1.3,'4-4-1':1.2,
  '5-1-1':1.3,'5-2-1':1.2,'5-3-1':1.2,'5-4-1':1.2,
  '6-1-1':1.2,'6-2-1':1.1,'6-3-1':1.1,'6-4-1':1.8,
  '7-1-1':1.1,'7-2-1':1.0,'7-3-1':1.0,'7-4-1':1.7,
  '8-1-1':1.0,'8-2-1':0.9,'8-3-1':0.9,'8-4-1':1.6,
  '9-1-1':0.9,'9-2-1':0.8,'9-3-1':0.8,'9-4-1':1.5,
  '10-1-1':0.8,'10-2-1':0.7,'10-3-1':0.7,'10-4-1':1.4,
  '1-1-2':1.9,'1-2-2':1.8,'1-3-2':2.0,'1-4-2':2.2,
  '2-1-2':1.8,'2-2-2':1.7,'2-3-2':1.9,'2-4-2':2.1,
  '3-1-2':1.7,'3-2-2':1.6,'3-3-2':1.8,'3-4-2':2.0,
  '4-1-2':1.6,'4-2-2':1.5,'4-3-2':1.7,'4-4-2':1.9,
  '5-1-2':1.5,'5-2-2':1.4,'5-3-2':1.6,'5-4-2':1.1,
  '6-1-2':1.4,'6-2-2':1.3,'6-3-2':1.5,'6-4-2':1.7,
  '7-1-2':1.3,'7-2-2':1.2,'7-3-2':1.4,'7-4-2':1.6,
  '8-1-2':1.2,'8-2-2':1.1,'8-3-2':1.3,'8-4-2':1.5,
  '9-1-2':1.1,'9-2-2':1.0,'9-3-2':1.2,'9-4-2':1.4,
  '10-1-2':1.0,'10-2-2':0.9,'10-3-2':1.1,'10-4-2':1.3,
};

const TAUX_COMP = {
  '34142A': 5/1000, '34142B': 8/1000,
  '34142C': 10/1000, '34142D': 1.5/1000,
};

const TRANCHES_VALEUR = [
  {code:1,max:2000000},{code:2,max:3000000},{code:3,max:4000000},
  {code:4,max:7000000},{code:5,max:10000000},{code:6,max:13000000},
  {code:7,max:16000000},{code:8,max:20000000},{code:9,max:25000000},
  {code:10,max:Infinity},
];
const TRANCHES_AGE = [
  {code:1,max:10},{code:2,max:15},{code:3,max:20},{code:4,max:Infinity},
];

function getCodeVal(v) { return (TRANCHES_VALEUR.find(t=>v<=t.max)||{code:10}).code; }
function getCodeAge(yr) { const age=new Date().getFullYear()-yr; return (TRANCHES_AGE.find(t=>age<=t.max)||{code:4}).code; }
function getCodeType(t) { return t==='sailboat'?2:1; }

function calcTotal(primeNette) {
  const cout_police = 500.00;
  const timbre      = 120.00;
  const tva         = Math.round((primeNette + cout_police) * 0.19 * 100) / 100;
  const total       = Math.round((primeNette + cout_police + tva + timbre) * 100) / 100;
  return { cout_police, tva, timbre, total };
}

async function generatePolicyNumber(conn) {
  const year = new Date().getFullYear();
  await conn.execute(
    `INSERT INTO contract_counter (year, last_number) VALUES (?, 1)
     ON DUPLICATE KEY UPDATE last_number = last_number + 1`,
    [year]
  );
  const [[counter]] = await conn.execute(
    `SELECT last_number FROM contract_counter WHERE year = ?`, [year]
  );
  const exerciseNum   = Number(counter.last_number);
  const contractIdNum = Number(Date.now() % 100000);
  const policyNumber  = String(`${contractIdNum}-${exerciseNum}`);
  return {
    contractIdNum,
    exerciseNum,
    contractYear: Number(year),
    policyNumber,
  };
}

function calcEndDate(startDate, duration) {
  const d = new Date(startDate);
  if (duration === '3_months')      d.setMonth(d.getMonth() + 3);
  else if (duration === '6_months') d.setMonth(d.getMonth() + 6);
  else                              d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

// ============================================================
//  POST /api/contracts/create
// ============================================================
const createContract = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    console.log('=== REQ BODY ===', JSON.stringify(req.body));

    const boat_id           = req.body.boat_id           ? Number(req.body.boat_id) : null;
    const contract_duration = req.body.contract_duration || '1_year';
    const guarantee_codes   = req.body.guarantee_codes   || [];
    const payment_method    = req.body.payment_method    || null;
    const today             = new Date().toISOString().split('T')[0];
    const start_date        = (req.body.start_date && req.body.start_date !== '')
                              ? req.body.start_date
                              : today;

    if (!boat_id) {
      await conn.rollback(); conn.release();
      return res.status(400).json({ success: false, message: 'boat_id is required' });
    }

    const [[boat]] = await conn.execute(
      `SELECT id, total_insured_value, construction_year, boat_type
       FROM boat WHERE id = ? AND user_id = ?`,
      [boat_id, req.user.id]
    );
    if (!boat) {
      await conn.rollback(); conn.release();
      return res.status(404).json({ success: false, message: 'Boat not found' });
    }

    const tiv        = parseFloat(boat.total_insured_value) || 0;
    const coeff      = COEFF_DUREE[contract_duration]       || 1;
    const codeVal    = getCodeVal(tiv);
    const codeAge    = getCodeAge(parseInt(boat.construction_year));
    const codeType   = getCodeType(boat.boat_type);
    const cleTable   = `${codeVal}-${codeAge}-${codeType}`;
    const taux34141A = TAUX_34141A[cleTable] || 1.0;

    const mainPremium = Math.round(tiv * taux34141A / 100 * 100) / 100;

    const codes = [...new Set(['34141A', ...guarantee_codes])];
    let optionsPremium = 0;
    const guaranteeLines = [];

    for (const code of codes) {
      if (code === '34141A') {
        guaranteeLines.push({ code, rate: taux34141A / 100, premium: mainPremium });
        continue;
      }
      const taux = TAUX_COMP[code];
      if (!taux) continue;
      const premium = Math.round(tiv * taux * 100) / 100;
      optionsPremium += premium;
      guaranteeLines.push({ code, rate: taux, premium });
    }

    const totalNet = mainPremium + optionsPremium;
    const adjusted = Math.round(totalNet * coeff * 100) / 100;
    const { cout_police, tva, timbre, total } = calcTotal(adjusted);
    const end_date = calcEndDate(start_date, contract_duration);

    const { contractIdNum, exerciseNum, contractYear, policyNumber } =
      await generatePolicyNumber(conn);

    const insertValues = [
      contractIdNum,
      exerciseNum,
      contractYear,
      policyNumber,
      Number(req.user.id),
      boat_id,
      contract_duration,
      start_date,
      end_date,
      tiv,
      mainPremium,
      optionsPremium,
      totalNet,
      coeff,
      adjusted,
      cout_police,
      0.19,
      tva,
      timbre,
      total,
      'pending',
      payment_method,
    ];

    console.log('=== INSERT VALUES ===', insertValues);

    const [result] = await conn.execute(
      `INSERT INTO insurance_contract (
         contract_id_num, exercise_num, contract_year, policy_number,
         user_id, boat_id, contract_duration, start_date, end_date,
         tiv, main_net_premium, options_net_premium, total_net_premium,
         duration_coefficient, adjusted_net_premium,
         cout_police, tva_rate, tva_amount, timbre, total_general,
         status, payment_method
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      insertValues
    );
    const contractId = result.insertId;

    for (const g of guaranteeLines) {
      await conn.execute(
        `INSERT INTO contract_guarantee (contract_id, guarantee_code, applied_rate, calculated_premium)
         VALUES (?, ?, ?, ?)`,
        [contractId, g.code, g.rate, g.premium]
      );
    }

    await conn.commit();
    conn.release();

    res.status(201).json({
      success: true,
      message: 'Contract created successfully',
      data: {
        contract_id:   contractId,
        policy_number: policyNumber,
        start_date,
        end_date,
        prime_nette:   adjusted,
        cout_police,
        tva,
        timbre,
        total_general: total,
      },
    });

  } catch (err) {
    await conn.rollback(); conn.release();
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  GET /api/contracts/mine
// ============================================================
const getMyContracts = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT ic.id, ic.policy_number, ic.start_date, ic.end_date,
              ic.total_general, ic.status, ic.contract_duration,
              b.boat_name, b.boat_type
       FROM insurance_contract ic
       JOIN boat b ON b.id = ic.boat_id
       WHERE ic.user_id = ?
       ORDER BY ic.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  GET /api/contracts/:id
// ============================================================
const getContractDetail = async (req, res) => {
  try {
    const [[contract]] = await db.execute(
      `SELECT ic.*,
              b.boat_name, b.boat_type, b.engine_power_hp,
              b.construction_year, b.construction_materials,
              b.gross_tonnage, b.length_m, b.beam_width_m,
              b.total_insured_value, b.registration_number, b.home_port,
              u.first_name, u.last_name, u.email, u.phone_number,
              u.address, u.wilaya, u.postal_code
       FROM insurance_contract ic
       JOIN boat b ON b.id = ic.boat_id
       JOIN user_account u ON u.id = ic.user_id
       WHERE ic.id = ?`,
      [req.params.id]
    );
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    if (req.user.role === 'client' && contract.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [guarantees] = await db.execute(
      `SELECT cg.guarantee_code, cg.applied_rate, cg.calculated_premium,
              g.label, g.guarantee_type
       FROM contract_guarantee cg
       JOIN guarantee g ON g.code = cg.guarantee_code
       WHERE cg.contract_id = ?`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...contract, guarantees } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  GET /api/contracts/admin/all
// ============================================================
const getAllContracts = async (req, res) => {
  try {
    const { status } = req.query;
    const page   = Number(req.query.page  || 1);
    const limit  = Number(req.query.limit || 20);
    const offset = Number((page - 1) * limit);

    let query = `
      SELECT ic.id, ic.policy_number, ic.start_date, ic.end_date,
             ic.total_general, ic.status, ic.created_at,
             b.boat_name, b.boat_type,
             CONCAT(u.first_name,' ',u.last_name) AS client_name,
             u.email AS client_email
      FROM insurance_contract ic
      JOIN boat b ON b.id = ic.boat_id
      JOIN user_account u ON u.id = ic.user_id
    `;
    const params = [];
    if (status) { query += ' WHERE ic.status = ?'; params.push(status); }
    query += ` ORDER BY ic.contract_year DESC, ic.exercise_num ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  PUT /api/contracts/:id/status
// ============================================================
const updateContractStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending','active','expired','cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    await db.execute(
      `UPDATE insurance_contract SET status = ? WHERE id = ?`,
      [status, req.params.id]
    );
    res.json({ success: true, message: 'Contract updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  DELETE /api/contracts/:id
// ============================================================
const deleteContract = async (req, res) => {
  try {
    await db.execute(`DELETE FROM insurance_contract WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Contract deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  GET /api/contracts/admin/clients
// ============================================================
const getAllClients = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone_number,
              u.wilaya, u.preferred_payment, u.created_at,
              COUNT(ic.id) AS total_contracts
       FROM user_account u
       LEFT JOIN insurance_contract ic ON ic.user_id = u.id
       WHERE u.role = 'client'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createContract, getMyContracts, getContractDetail,
  getAllContracts, updateContractStatus, deleteContract, getAllClients,
};