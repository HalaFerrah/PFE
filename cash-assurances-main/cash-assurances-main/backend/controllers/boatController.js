const Boat   = require('../models/Boat');
const upload = require('../middleware/upload');

// GET /api/boats
const getMyBoats = async (req, res) => {
  try {
    const boats = await Boat.findByUser(req.user.id);
    res.json({ success: true, data: boats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/boats/:id
const getBoat = async (req, res) => {
  try {
    const boat = await Boat.findById(req.params.id, req.user.id);
    if (!boat) return res.status(404).json({ success: false, message: 'Boat not found' });
    res.json({ success: true, data: boat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/boats
const createBoat = async (req, res) => {
  try {
    const files = req.files || {};

    const data = {
      ...req.body,
      photo_main:            files.photo_main?.[0]?.path            || null,
      photo_front:           files.photo_front?.[0]?.path           || null,
      photo_rear:            files.photo_rear?.[0]?.path            || null,
      photo_interior:        files.photo_interior?.[0]?.path        || null,
      photo_engine:          files.photo_engine?.[0]?.path          || null,
      photo_hull:            files.photo_hull?.[0]?.path            || null,
      doc_ownership_title:   files.doc_ownership_title?.[0]?.path   || null,
      doc_registration_card: files.doc_registration_card?.[0]?.path || null,
    };

    const id = await Boat.create(req.user.id, data);
    res.status(201).json({ success: true, message: 'Boat registered successfully', data: { id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/boats/:id
const updateBoat = async (req, res) => {
  try {
    const updated = await Boat.update(req.params.id, req.user.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Boat not found or nothing to update' });
    res.json({ success: true, message: 'Boat updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/boats/:id
const deleteBoat = async (req, res) => {
  try {
    const deleted = await Boat.delete(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Boat not found' });
    res.json({ success: true, message: 'Boat deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMyBoats, getBoat, createBoat, updateBoat, deleteBoat };
