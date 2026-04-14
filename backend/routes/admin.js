const express = require('express');
const router  = express.Router();
const {
  getDurations, createDuration, updateDuration, deleteDuration,
  getMaterials, createMaterial, updateMaterial, deleteMaterial,
  getBrands,    createBrand,    updateBrand,    deleteBrand,
  getGuarantees,createGuarantee,updateGuarantee,deleteGuarantee,
  getStats,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// Toutes les routes admin nécessitent d'être connecté et admin
router.use(authenticate);
router.use(authorize('admin'));

// ── Stats dashboard ────────────────────────────────────────
router.get('/stats', getStats);

// ── Durées ─────────────────────────────────────────────────
router.get('/durations',      getDurations);
router.post('/durations',     createDuration);
router.put('/durations/:id',  updateDuration);
router.delete('/durations/:id', deleteDuration);

// ── Matériaux ──────────────────────────────────────────────
router.get('/materials',      getMaterials);
router.post('/materials',     createMaterial);
router.put('/materials/:id',  updateMaterial);
router.delete('/materials/:id', deleteMaterial);

// ── Marques ────────────────────────────────────────────────
router.get('/brands',         getBrands);
router.post('/brands',        createBrand);
router.put('/brands/:id',     updateBrand);
router.delete('/brands/:id',  deleteBrand);

// ── Garanties et taux ──────────────────────────────────────
router.get('/guarantees',       getGuarantees);
router.post('/guarantees',      createGuarantee);
router.put('/guarantees/:id',   updateGuarantee);
router.delete('/guarantees/:id', deleteGuarantee);

module.exports = router;
