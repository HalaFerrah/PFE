const db = require('../db');

// ============================================================
//  GET /api/assureur/contracts
//  Assureur — voir tous les contrats
// ============================================================
const getAllContracts = async (req, res) => {
  try {
    const { status, search } = req.query;
    const page   = Number(req.query.page  || 1);
    const limit  = Number(req.query.limit || 20);
    const offset = Number((page - 1) * limit);

    let query = `
      SELECT ic.id, ic.policy_number, ic.start_date, ic.end_date,
             ic.total_general, ic.status, ic.contract_duration,
             ic.created_at, ic.adjusted_net_premium,
             b.boat_name, b.boat_type, b.registration_number,
             CONCAT(u.first_name, ' ', u.last_name) AS client_name,
             u.email AS client_email, u.phone_number
      FROM insurance_contract ic
      JOIN boat b ON b.id = ic.boat_id
      JOIN user_account u ON u.id = ic.user_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND ic.status = ?';
      params.push(status);
    }
    if (search) {
      query += ` AND (ic.policy_number LIKE ? OR u.first_name LIKE ?
                 OR u.last_name LIKE ? OR b.boat_name LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ` ORDER BY ic.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.execute(query, params);

    // Total pour pagination
    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM insurance_contract`, []
    );

    res.json({ success: true, data: rows, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  GET /api/assureur/contracts/:id
//  Assureur — détail complet d'un contrat
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
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contrat introuvable' });
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
//  GET /api/assureur/sinistres
//  Assureur — voir tous les sinistres
// ============================================================
const getAllSinistres = async (req, res) => {
  try {
    const { status, search } = req.query;
    const page   = Number(req.query.page  || 1);
    const limit  = Number(req.query.limit || 20);
    const offset = Number((page - 1) * limit);

    let query = `
      SELECT s.id, s.date_sinistre, s.lieu_sinistre,
             s.type_sinistre, s.status, s.created_at,
             s.autre_nom, s.autre_prenom, s.autre_bateau_id, s.autre_compagnie,
             b.boat_name, b.registration_number,
             ic.policy_number,
             CONCAT(u.first_name, ' ', u.last_name) AS client_name,
             u.email AS client_email, u.phone_number
      FROM sinistre s
      JOIN boat b ON b.id = s.boat_id
      JOIN insurance_contract ic ON ic.id = s.contract_id
      JOIN user_account u ON u.id = s.user_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }
    if (search) {
      query += ` AND (ic.policy_number LIKE ? OR u.first_name LIKE ?
                 OR u.last_name LIKE ? OR b.boat_name LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ` ORDER BY s.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  GET /api/assureur/sinistres/:id
//  Assureur — détail complet d'un sinistre
// ============================================================
const getSinistreDetail = async (req, res) => {
  try {
    const [[sinistre]] = await db.execute(
      `SELECT s.*,
              b.boat_name, b.boat_type, b.registration_number,
              b.engine_power_hp, b.construction_year,
              ic.policy_number, ic.start_date, ic.end_date, ic.total_general,
              u.first_name, u.last_name, u.email, u.phone_number,
              u.address, u.wilaya
       FROM sinistre s
       JOIN boat b ON b.id = s.boat_id
       JOIN insurance_contract ic ON ic.id = s.contract_id
       JOIN user_account u ON u.id = s.user_id
       WHERE s.id = ?`,
      [req.params.id]
    );
    if (!sinistre) {
      return res.status(404).json({ success: false, message: 'Sinistre introuvable' });
    }
    res.json({ success: true, data: sinistre });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  PUT /api/assureur/sinistres/:id/status
//  Assureur — mettre à jour le statut d'un sinistre
// ============================================================
const updateSinistreStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['soumis', 'en_cours', 'resolu', 'rejete'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }
    await db.execute(
      `UPDATE sinistre SET status = ? WHERE id = ?`,
      [status, req.params.id]
    );
    res.json({ success: true, message: 'Statut du sinistre mis à jour' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  GET /api/assureur/clients
//  Assureur — liste des clients avec leurs contrats
// ============================================================
const getAllClients = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.first_name, u.last_name, u.email,
              u.phone_number, u.wilaya, u.created_at,
              COUNT(DISTINCT ic.id) AS total_contracts,
              COUNT(DISTINCT s.id)  AS total_sinistres
       FROM user_account u
       LEFT JOIN insurance_contract ic ON ic.user_id = u.id
       LEFT JOIN sinistre s ON s.user_id = u.id
       WHERE u.role = 'client'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  GET /api/assureur/stats
//  Assureur — statistiques générales
// ============================================================
const getStats = async (req, res) => {
  try {
    const [[contracts]]  = await db.execute(`SELECT COUNT(*) AS total FROM insurance_contract`);
    const [[active]]     = await db.execute(`SELECT COUNT(*) AS total FROM insurance_contract WHERE status = 'active'`);
    const [[clients]]    = await db.execute(`SELECT COUNT(*) AS total FROM user_account WHERE role = 'client'`);
    const [[sinistres]]  = await db.execute(`SELECT COUNT(*) AS total FROM sinistre`);
    const [[enCours]]    = await db.execute(`SELECT COUNT(*) AS total FROM sinistre WHERE status = 'en_cours'`);
    const [[revenue]]    = await db.execute(`SELECT COALESCE(SUM(total_general), 0) AS total FROM insurance_contract WHERE status = 'active'`);

    res.json({
      success: true,
      data: {
        total_contracts:   contracts.total,
        active_contracts:  active.total,
        total_clients:     clients.total,
        total_sinistres:   sinistres.total,
        sinistres_en_cours: enCours.total,
        total_revenue:     revenue.total,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllContracts,
  getContractDetail,
  getAllSinistres,
  getSinistreDetail,
  updateSinistreStatus,
  getAllClients,
  getStats,
};