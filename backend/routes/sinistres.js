const express = require('express');
const router  = express.Router();
const {
  createSinistre,
  getMySinistres,
  getSinistreDetail,
  getAllSinistres,
  updateSinistreStatus,
} = require('../controllers/sinistreController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// ── Client ─────────────────────────────────────────────────
router.post('/',         createSinistre);
router.get('/mine',      getMySinistres);

// ── Assureur et Admin ──────────────────────────────────────
router.get('/assureur/all',      authorize('assureur', 'admin'), getAllSinistres);
router.put('/:id/status',        authorize('assureur', 'admin'), updateSinistreStatus);

// ── Détail (client voit le sien, assureur/admin voient tout)
router.get('/:id',       getSinistreDetail);

module.exports = router;