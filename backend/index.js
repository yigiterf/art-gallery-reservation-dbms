const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const eserRoutes = require('./routes/eserRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const etkinlikRoutes = require('./routes/etkinlikRoutes');
const destekRoutes = require('./routes/destekRoutes');
const islemRoutes = require('./routes/islemRoutes');
const favoriRoutes = require('./routes/favoriRoutes');
const yorumRoutes = require('./routes/yorumRoutes');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Resim dosyalarını dışarıya public link olarak açma
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const initDb = require('./initDb');
initDb();

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/eserler', eserRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/etkinlikler', etkinlikRoutes);
app.use('/api/destek', destekRoutes);
app.use('/api/islemler', islemRoutes);
app.use('/api/favoriler', favoriRoutes);
app.use('/api/yorumlar', yorumRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', db: 'connected', time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
