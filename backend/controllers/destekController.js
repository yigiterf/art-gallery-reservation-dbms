const pool = require('../db');

exports.createDestek = async (req, res) => {
  const { kullanici_id, konu, mesaj, islem_id } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO destek_talepleri (kullanici_id, konu, mesaj, islem_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [kullanici_id, konu, mesaj, islem_id || null]
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
      `SELECT d.*, 
              e.baslik AS eser_baslik, 
              et.baslik AS etkinlik_baslik,
              i.toplam_tutar AS islem_tutar,
              i.durum AS islem_durum
       FROM destek_talepleri d
       LEFT JOIN islemler i ON d.islem_id = i.id
       LEFT JOIN eserler e ON i.eser_id = e.id
       LEFT JOIN etkinlikler et ON i.etkinlik_id = et.id
       WHERE d.kullanici_id = $1 
       ORDER BY d.id DESC`,
      [kullanici_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Destek talepleri alınamadı.' });
  }
};
