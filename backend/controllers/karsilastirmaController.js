const pool = require('../db');

// Kullanıcının kayıtlı karşılaştırmalarını getir
exports.getKarsilastirmalar = async (req, res) => {
  const { kullanici_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM karsilastirmalar WHERE kullanici_id = $1 ORDER BY id DESC',
      [kullanici_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Karşılaştırmalar alınamadı.' });
  }
};

// Karşılaştırma kaydet
exports.saveKarsilastirma = async (req, res) => {
  const { kullanici_id, tip, oge_idler } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO karsilastirmalar (kullanici_id, tip, oge_idler) VALUES ($1, $2, $3) RETURNING *',
      [kullanici_id, tip, JSON.stringify(oge_idler)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Karşılaştırma kaydetme hatası:', err);
    res.status(500).json({ message: 'Karşılaştırma kaydedilemedi.' });
  }
};

// Karşılaştırma sil
exports.deleteKarsilastirma = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM karsilastirmalar WHERE id = $1', [id]);
    res.json({ message: 'Karşılaştırma silindi.' });
  } catch (err) {
    res.status(500).json({ message: 'Karşılaştırma silinemedi.' });
  }
};
