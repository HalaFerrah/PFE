const express  = require('express');
const router   = express.Router();
const { calculer } = require('../controllers/devisController');

router.post('/calculer', calculer);

module.exports = router;