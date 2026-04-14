const express = require('express');
const router  = express.Router();
const {
  createBrouillon,
  getMyBrouillons,
  getBrouillonDetail,
  deleteBrouillon,
} = require('../controllers/brouillonController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/',      createBrouillon);
router.get('/mine',   getMyBrouillons);
router.get('/:id',    getBrouillonDetail);
router.delete('/:id', deleteBrouillon);

module.exports = router;