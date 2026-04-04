const express  = require('express');
const router   = express.Router();
const premiumController = require('../controllers/premiumController');

router.post('/simulate', premiumController.simulate);

module.exports = router;