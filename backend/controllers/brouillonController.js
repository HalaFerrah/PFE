const db = require('../db');

// ── Table taux 34141A ─────────────────────────────────────
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

const COEFF_DUREE = { '3_months': 0.35, '6_months': 0.60, '1_year': 1.00 };

// ============================================================
//  POST /api/brouillons
//  Client — sauvegarder un devis brouillon (7 jours)
// ============================================================
const createBrouillon = async (req, res) => {
  try {
    const {
      boat_id,
      contract_duration = '1_year',
      guarantee_codes   = [],
    } = req.body;

    if (!boat_id) {
      return res.status(400).json({ success: false, message: 'boat_id requis' });
    }

    // Vérifier que le client a au moins un contrat actif
    const [[contrat]] = await db.execute(
      `SELECT id FROM insurance_contract WHERE user_id = ? LIMIT 1`,
      [req.user.id]
    );
    if (!contrat) {
      return res.status(403).json({
        success: false,
        message: 'Vous devez avoir au moins un contrat pour sauvegarder un brouillon'
      });
    }

    // Récupérer le bateau
    const [[boat]] = await db.execute(
      `SELECT id, total_insured_value, construction_year, boat_type
       FROM boat WHERE id = ? AND user_id = ?`,
      [boat_id, req.user.id]
    );
    if (!boat) {
      return res.status(404).json({ success: false, message: 'Bateau introuvable' });
    }

    // Calcul
    const tiv        = parseFloat(boat.total_insured_value) || 0;
    const coeff      = COEFF_DUREE[contract_duration] || 1;
    const codeVal    = getCodeVal(tiv);
    const codeAge    = getCodeAge(parseInt(boat.construction_year));
    const codeType   = getCodeType(boat.boat_type);
    const cleTable   = `${codeVal}-${codeAge}-${codeType}`;
    const taux34141A = TAUX_34141A[cleTable] || 1.0;

    const mainPremium = Math.round(tiv * taux34141A / 100 * 100) / 100;
    const codes = [...new Set(['34141A', ...guarantee_codes])];
    let optionsPremium = 0;

    for (const code of codes) {
      if (code === '34141A') continue;
      const taux = TAUX_COMP[code];
      if (!taux) continue;
      optionsPremium += Math.round(tiv * taux * 100) / 100;
    }

    const totalNet   = mainPremium + optionsPremium;
    const adjusted   = Math.round(totalNet * coeff * 100) / 100;
    const cout_police = 500;
    const timbre      = 120;
    const tva         = Math.round((adjusted + cout_police) * 0.19 * 100) / 100;
    const prime_totale = Math.round((adjusted + cout_police + tva + timbre) * 100) / 100;

    // Snapshot des taux actuels
    const taux_snapshot = { taux34141A, TAUX_COMP, coeff };

    // Date d'expiration — 7 jours
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7);

    const [result] = await db.execute(
      `INSERT INTO devis_brouillon (
         user_id, boat_id, contract_duration, guarantee_codes,
         prime_nette, tva, timbre, cout_police, prime_totale,
         taux_snapshot, expires_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, boat_id, contract_duration,
        JSON.stringify(guarantee_codes),
        adjusted, tva, timbre, cout_police, prime_totale,
        JSON.stringify(taux_snapshot),
        expires_at.toISOString().split('T')[0],
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Brouillon sauvegardé — valable 7 jours',
      data: {
        brouillon_id: result.insertId,
        prime_nette:  adjusted,
        tva,
        timbre,
        cout_police,
        prime_totale,
        expires_at: expires_at.toISOString().split('T')[0],
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  GET /api/brouillons/mine
//  Client — voir ses brouillons actifs
// ============================================================
const getMyBrouillons = async (req, res) => {
  try {
    // Supprimer automatiquement les brouillons expirés
    await db.execute(
      `UPDATE devis_brouillon SET status = 'expired'
       WHERE expires_at < NOW() AND status = 'active'`
    );

    const [rows] = await db.execute(
      `SELECT db.id, db.contract_duration, db.guarantee_codes,
              db.prime_nette, db.prime_totale, db.expires_at, db.status,
              b.boat_name, b.boat_type
       FROM devis_brouillon db
       JOIN boat b ON b.id = db.boat_id
       WHERE db.user_id = ? AND db.status = 'active'
       ORDER BY db.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  GET /api/brouillons/:id
//  Client — détail d'un brouillon
// ============================================================
const getBrouillonDetail = async (req, res) => {
  try {
    const [[brouillon]] = await db.execute(
      `SELECT db.*, b.boat_name, b.boat_type, b.total_insured_value
       FROM devis_brouillon db
       JOIN boat b ON b.id = db.boat_id
       WHERE db.id = ? AND db.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!brouillon) {
      return res.status(404).json({ success: false, message: 'Brouillon introuvable' });
    }

    // Vérifier si les taux ont changé
    const snapshot    = JSON.parse(brouillon.taux_snapshot);
    const codeVal     = getCodeVal(parseFloat(brouillon.total_insured_value));
    const codeAge     = getCodeAge(parseInt(brouillon.construction_year));
    const codeType    = getCodeType(brouillon.boat_type);
    const cleTable    = `${codeVal}-${codeAge}-${codeType}`;
    const tauxActuel  = TAUX_34141A[cleTable] || 1.0;
    const tauxChanged = tauxActuel !== snapshot.taux34141A;

    if (tauxChanged && brouillon.status === 'active') {
      await db.execute(
        `UPDATE devis_brouillon SET status = 'cancelled' WHERE id = ?`,
        [brouillon.id]
      );
      return res.status(200).json({
        success: false,
        message: 'Ce brouillon a été annulé car les taux ont changé',
        data: { ...brouillon, status: 'cancelled' }
      });
    }

    res.json({ success: true, data: brouillon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  DELETE /api/brouillons/:id
//  Client — supprimer un brouillon
// ============================================================
const deleteBrouillon = async (req, res) => {
  try {
    await db.execute(
      `DELETE FROM devis_brouillon WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Brouillon supprimé' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createBrouillon,
  getMyBrouillons,
  getBrouillonDetail,
  deleteBrouillon,
};