require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// ── Routes API ─────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/boats',      require('./routes/boats'));
app.use('/api/devis',      require('./routes/devis'));
app.use('/api/contracts',  require('./routes/contracts'));
app.use('/api/admin',      require('./routes/admin'));
app.use('/api/sinistres',  require('./routes/sinistres'));
app.use('/api/brouillons', require('./routes/brouillons'));
app.use('/api/assureur',   require('./routes/assureur'));

// ── Page de test ───────────────────────────────────────────
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

// ── Health check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CASH Assurances API', version: '1.0.0' });
});

// ── Route introuvable ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.path} not found` });
});

// ── Erreurs globales ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 CASH Assurances API – port ${PORT}`);
});

module.exports = app;