const db = require('../db');

// ============================================================
//  DURÉES
// ============================================================

// GET /api/admin/durations
const getDurations = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM contract_duration_config ORDER BY months ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/durations
const createDuration = async (req, res) => {
  try {
    const { code, label, months, coefficient } = req.body;
    if (!code || !label || !months || !coefficient) {
      return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
    }
    await db.execute(
      `INSERT INTO contract_duration_config (code, label, months, coefficient) VALUES (?, ?, ?, ?)`,
      [code, label, Number(months), Number(coefficient)]
    );
    res.status(201).json({ success: true, message: 'Durée créée' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/durations/:id
const updateDuration = async (req, res) => {
  try {
    const { label, months, coefficient, is_active } = req.body;
    await db.execute(
      `UPDATE contract_duration_config SET label=?, months=?, coefficient=?, is_active=? WHERE id=?`,
      [label, Number(months), Number(coefficient), is_active ? 1 : 0, req.params.id]
    );
    res.json({ success: true, message: 'Durée mise à jour' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/durations/:id
const deleteDuration = async (req, res) => {
  try {
    await db.execute(
      `DELETE FROM contract_duration_config WHERE id = ?`, [req.params.id]
    );
    res.json({ success: true, message: 'Durée supprimée' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  MATÉRIAUX
// ============================================================

// GET /api/admin/materials
const getMaterials = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM boat_material_config ORDER BY label ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/materials
const createMaterial = async (req, res) => {
  try {
    const { code, label } = req.body;
    if (!code || !label) {
      return res.status(400).json({ success: false, message: 'Code et label requis' });
    }
    await db.execute(
      `INSERT INTO boat_material_config (code, label) VALUES (?, ?)`,
      [code, label]
    );
    res.status(201).json({ success: true, message: 'Matériau créé' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/materials/:id
const updateMaterial = async (req, res) => {
  try {
    const { label, is_active } = req.body;
    await db.execute(
      `UPDATE boat_material_config SET label=?, is_active=? WHERE id=?`,
      [label, is_active ? 1 : 0, req.params.id]
    );
    res.json({ success: true, message: 'Matériau mis à jour' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/materials/:id
const deleteMaterial = async (req, res) => {
  try {
    await db.execute(
      `DELETE FROM boat_material_config WHERE id = ?`, [req.params.id]
    );
    res.json({ success: true, message: 'Matériau supprimé' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  MARQUES DE BATEAUX
// ============================================================

// GET /api/admin/brands
const getBrands = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM boat_brand ORDER BY name ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/brands
const createBrand = async (req, res) => {
  try {
    const { name, country } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Le nom est requis' });
    }
    await db.execute(
      `INSERT INTO boat_brand (name, country) VALUES (?, ?)`,
      [name, country || null]
    );
    res.status(201).json({ success: true, message: 'Marque créée' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/brands/:id
const updateBrand = async (req, res) => {
  try {
    const { name, country, is_active } = req.body;
    await db.execute(
      `UPDATE boat_brand SET name=?, country=?, is_active=? WHERE id=?`,
      [name, country || null, is_active ? 1 : 0, req.params.id]
    );
    res.json({ success: true, message: 'Marque mise à jour' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/brands/:id
const deleteBrand = async (req, res) => {
  try {
    await db.execute(
      `DELETE FROM boat_brand WHERE id = ?`, [req.params.id]
    );
    res.json({ success: true, message: 'Marque supprimée' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  GARANTIES ET TAUX
// ============================================================

// GET /api/admin/guarantees
const getGuarantees = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM guarantee_config ORDER BY code ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/guarantees
const createGuarantee = async (req, res) => {
  try {
    const { code, label, rate, rate_type } = req.body;
    if (!code || !label || !rate) {
      return res.status(400).json({ success: false, message: 'Code, label et taux requis' });
    }
    await db.execute(
      `INSERT INTO guarantee_config (code, label, rate, rate_type) VALUES (?, ?, ?, ?)`,
      [code, label, Number(rate), rate_type || 'permille']
    );
    res.status(201).json({ success: true, message: 'Garantie créée' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/guarantees/:id
const updateGuarantee = async (req, res) => {
  try {
    const { label, rate, rate_type, is_active } = req.body;
    await db.execute(
      `UPDATE guarantee_config SET label=?, rate=?, rate_type=?, is_active=? WHERE id=?`,
      [label, Number(rate), rate_type, is_active ? 1 : 0, req.params.id]
    );
    res.json({ success: true, message: 'Garantie mise à jour' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/guarantees/:id
const deleteGuarantee = async (req, res) => {
  try {
    await db.execute(
      `DELETE FROM guarantee_config WHERE id = ?`, [req.params.id]
    );
    res.json({ success: true, message: 'Garantie supprimée' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
//  STATISTIQUES DASHBOARD ADMIN
// ============================================================

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [[contracts]] = await db.execute(
      `SELECT COUNT(*) AS total FROM insurance_contract`
    );
    const [[active]] = await db.execute(
      `SELECT COUNT(*) AS total FROM insurance_contract WHERE status = 'active'`
    );
    const [[clients]] = await db.execute(
      `SELECT COUNT(*) AS total FROM user_account WHERE role = 'client'`
    );
    const [[sinistres]] = await db.execute(
      `SELECT COUNT(*) AS total FROM sinistre`
    );
    const [[revenue]] = await db.execute(
      `SELECT COALESCE(SUM(total_general), 0) AS total FROM insurance_contract WHERE status = 'active'`
    );

    res.json({
      success: true,
      data: {
        total_contracts:  contracts.total,
        active_contracts: active.total,
        total_clients:    clients.total,
        total_sinistres:  sinistres.total,
        total_revenue:    revenue.total,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDurations, createDuration, updateDuration, deleteDuration,
  getMaterials, createMaterial, updateMaterial, deleteMaterial,
  getBrands,    createBrand,    updateBrand,    deleteBrand,
  getGuarantees,createGuarantee,updateGuarantee,deleteGuarantee,
  getStats,
};
