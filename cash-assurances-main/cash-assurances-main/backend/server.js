require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/boats',     require('./routes/boats'));
app.use('/api/premium',   require('./routes/premium'));
app.use('/api/contracts', require('./routes/contracts'));  // ← NOUVEAU

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CASH Assurances API', version: '2.0.0' });
});

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.path} not found` }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀  CASH Assurances API — port ${PORT}`);
});

module.exports = app;
