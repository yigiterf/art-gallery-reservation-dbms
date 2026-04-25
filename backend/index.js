const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const eserRoutes = require('./routes/eserRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/eserler', eserRoutes);

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
