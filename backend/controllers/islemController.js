const pool = require('../db');

exports.createIslem = async (req, res) => {
  const { kullanici_id, eser_id, etkinlik_id, katilimci_sayisi, toplam_tutar, odeme_yontemi } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO islemler 
        (kullanici_id, eser_id, etkinlik_id, katilimci_sayisi, toplam_tutar, odeme_yontemi, durum) 
       VALUES ($1, $2, $3, $4, $5, $6, 'Onaylandı') 
       RETURNING *`,
      [kullanici_id, eser_id || null, etkinlik_id || null, katilimci_sayisi || 1, toplam_tutar, odeme_yontemi || 'Kredi Kartı']
    );

    // Eğer etkinlikse kontenjanı düşür
    if (etkinlik_id) {
      await pool.query('UPDATE etkinlikler SET kontenjan = kontenjan - $1 WHERE id = $2', [katilimci_sayisi || 1, etkinlik_id]);
    }

    res.status(201).json({ message: 'İşlem başarılı', data: result.rows[0] });
  } catch (error) {
    console.error('İşlem oluşturma hatası:', error);
    res.status(500).json({ message: 'İşlem gerçekleştirilemedi.' });
  }
};

exports.getUserIslemler = async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `
      SELECT 
        i.*,
        e.baslik AS eser_baslik,
        e.gorsel_url AS eser_gorsel,
        et.baslik AS etkinlik_baslik,
        et.tarih_saat AS etkinlik_tarih
      FROM islemler i
      LEFT JOIN eserler e ON i.eser_id = e.id
      LEFT JOIN etkinlikler et ON i.etkinlik_id = et.id
      WHERE i.kullanici_id = $1
      ORDER BY i.islem_tarihi DESC
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('İşlemleri getirme hatası:', error);
    res.status(500).json({ message: 'İşlemler alınamadı.' });
  }
};
