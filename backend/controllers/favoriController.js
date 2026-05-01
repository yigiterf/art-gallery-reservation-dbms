const pool = require('../db');

// Kullanıcının favorilerini getir
exports.getFavoriler = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT e.*, s.ad as sanatci_adi
       FROM favoriler f
       JOIN eserler e ON f.eser_id = e.id
       LEFT JOIN sanatcilar s ON e.sanatci_id = s.id
       WHERE f.kullanici_id = $1
       ORDER BY e.id DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Kullanıcının favori ID listesini getir (hızlı kontrol için)
exports.getFavoriIdler = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT eser_id FROM favoriler WHERE kullanici_id = $1',
      [userId]
    );
    res.json(result.rows.map(r => r.eser_id));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Favoriye ekle
exports.addFavori = async (req, res) => {
  const { kullanici_id, eser_id } = req.body;
  try {
    await pool.query(
      'INSERT INTO favoriler (kullanici_id, eser_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [kullanici_id, eser_id]
    );
    res.json({ success: true, message: 'Favorilere eklendi.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Favoriden çıkar
exports.removeFavori = async (req, res) => {
  const { userId, eserIdParam } = req.params;
  try {
    await pool.query(
      'DELETE FROM favoriler WHERE kullanici_id = $1 AND eser_id = $2',
      [userId, eserIdParam]
    );
    res.json({ success: true, message: 'Favorilerden çıkarıldı.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
