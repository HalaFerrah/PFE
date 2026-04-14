const express = require('express');
const router  = express.Router();
const {
  getAllContracts,
  getContractDetail,
  getAllSinistres,
  getSinistreDetail,
  updateSinistreStatus,
  getAllClients,
  getStats,
} = require('../controllers/assureurController');
const { authenticate, authorize } = require('../middleware/auth');

// Toutes les routes assureur nécessitent d'être connecté
router.use(authenticate);
router.use(authorize('assureur', 'admin'));

// ── Stats ──────────────────────────────────────────────────
router.get('/stats', getStats);

// ── Clients ────────────────────────────────────────────────
router.get('/clients', getAllClients);

// ── Contrats ───────────────────────────────────────────────
router.get('/contracts',     getAllContracts);
router.get('/contracts/:id', getContractDetail);

// ── Sinistres ──────────────────────────────────────────────
router.get('/sinistres',              getAllSinistres);
router.get('/sinistres/:id',          getSinistreDetail);
router.put('/sinistres/:id/status',   updateSinistreStatus);

module.exports = router;