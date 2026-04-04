// routes/contracts.js
const express = require('express');
const router  = express.Router();
const {
  createContract, getMyContracts, getContractDetail,
  getAllContracts, updateContractStatus, deleteContract, getAllClients,
} = require('../controllers/contractController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Client
router.get('/mine',           getMyContracts);
router.post('/create',        createContract);
router.get('/:id',            getContractDetail);

// Admin uniquement
router.get('/admin/all',      authorize('admin','agent'), getAllContracts);
router.get('/admin/clients',  authorize('admin','agent'), getAllClients);
router.put('/:id/status',     authorize('admin','agent'), updateContractStatus);
router.delete('/:id',         authorize('admin'),         deleteContract);

module.exports = router;
