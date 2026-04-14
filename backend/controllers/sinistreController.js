const db = require('../db');

// ============================================================
//  POST /api/sinistres
//  Client — déclarer un sinistre
// ============================================================
const createSinistre = async (req, res) => {
  try {
    const {
      contract_id,
      boat_id,
      date_sinistre,
      lieu_sinistre,
      description,
      type_sinistre    = 'autre',
      autre_nom        = null,
      autre_prenom     = null,
      autre_bateau_id  = null,
      autre_compagnie  = null,
    } = req.body;

    // Validation
    if (!contract_id || !boat_id || !date_sinistre || !lieu_sinistre || !description) {
      return res.status(400).json({
        success: false,
        message: 'contract_id, boat_id, date_sinistre, lieu_sinistre et description sont requis'
      });
    }

    // Vérifier que le contrat appartient au client
    const [[contract]] = await db.execute(
      `SELECT id FROM insurance_contract WHERE id = ? AND user_id = ?`,
      [contract_id, req.user.id]
    );
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contrat introuvable' });
    }

    const [result] = await db.execute(
      `INSERT INTO sinistre (
         user_id, contract_id, boat_id,
         date_sinistre, lieu_sinistre, description, type_sinistre,
         autre_nom, autre_prenom, autre_bateau_id, autre_compagnie
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, contract_id, boat_id,
        date_sinistre, lieu_sinistre, description, type_sinistre,
        autre_nom, autre_prenom, autre_bateau_id, autre_compagnie,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Déclaration de sinistre soumise',
      data: { sinistre_id: result.insertId }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  GET /api/sinistres/mine
//  Client — voir ses propres sinistres
// ============================================================
const getMySinistres = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT s.id, s.date_sinistre, s.lieu_sinistre, s.type_sinistre,
              s.status, s.created_at,
              b.boat_name, ic.policy_number
       FROM sinistre s
       JOIN boat b ON b.id = s.boat_id
       JOIN insurance_contract ic ON ic.id = s.contract_id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  GET /api/sinistres/:id
//  Client ou Assureur — détail d'un sinistre
// ============================================================
const getSinistreDetail = async (req, res) => {
  try {
    const [[sinistre]] = await db.execute(
      `SELECT s.*,
              b.boat_name, b.boat_type, b.registration_number,
              b.engine_power_hp, b.construction_year,
              ic.policy_number, ic.start_date, ic.end_date,
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

    // Client ne peut voir que ses propres sinistres
    if (req.user.role === 'client' && sinistre.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    res.json({ success: true, data: sinistre });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  GET /api/sinistres/assureur/all
//  Assureur/Admin — voir tous les sinistres
// ============================================================
const getAllSinistres = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = Number((page - 1) * limit);

    let query = `
      SELECT s.id, s.date_sinistre, s.lieu_sinistre, s.type_sinistre,
             s.status, s.created_at,
             b.boat_name, ic.policy_number,
             CONCAT(u.first_name, ' ', u.last_name) AS client_name,
             u.email AS client_email
      FROM sinistre s
      JOIN boat b ON b.id = s.boat_id
      JOIN insurance_contract ic ON ic.id = s.contract_id
      JOIN user_account u ON u.id = s.user_id
    `;
    const params = [];
    if (status) { query += ' WHERE s.status = ?'; params.push(status); }
    query += ` ORDER BY s.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);

    const [rows] = await db.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  PUT /api/sinistres/:id/status
//  Assureur/Admin — mettre à jour le statut
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
    res.json({ success: true, message: 'Statut mis à jour' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createSinistre,
  getMySinistres,
  getSinistreDetail,
  getAllSinistres,
  updateSinistreStatus,
};