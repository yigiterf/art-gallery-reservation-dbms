const pool = require('../db');

exports.createDestek = async (req, res) => {
  const { kullanici_id, konu, mesaj } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO destek_talepleri (kullanici_id, konu, mesaj) VALUES ($1, $2, $3) RETURNING *",
      [kullanici_id, konu, mesaj]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Destek kaydı oluşturulamadı:', error);
    res.status(500).json({ message: 'Destek talebi oluşturulamadı.' });
  }
};

exports.getBenimDesteklerim = async (req, res) => {
  const { kullanici_id } = req.query;
  try {
    const result = await pool.query(
      "SELECT * FROM destek_talepleri WHERE kullanici_id = $1 ORDER BY id DESC",
      [kullanici_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Destek talepleri alınamadı.' });
  }
};
