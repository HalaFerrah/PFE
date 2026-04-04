const express = require('express');
const router  = express.Router();
const { getMyBoats, getBoat, createBoat, updateBoat, deleteBoat } = require('../controllers/boatController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);

const boatFiles = upload.fields([
  { name: 'photo_main',            maxCount: 1 },
  { name: 'photo_front',           maxCount: 1 },
  { name: 'photo_rear',            maxCount: 1 },
  { name: 'photo_interior',        maxCount: 1 },
  { name: 'photo_engine',          maxCount: 1 },
  { name: 'photo_hull',            maxCount: 1 },
  { name: 'doc_ownership_title',   maxCount: 1 },
  { name: 'doc_registration_card', maxCount: 1 },
]);

router.get('/',      getMyBoats);
router.get('/:id',   getBoat);
router.post('/',     boatFiles, createBoat);
router.put('/:id',   boatFiles, updateBoat);
router.delete('/:id', deleteBoat);

module.exports = router;
