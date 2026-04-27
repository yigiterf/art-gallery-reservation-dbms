const pool = require('../db');

// Etkinlik Oluştur
exports.createEtkinlik = async (req, res) => {
  const { baslik, tarih_saat, ucret, kontenjan, sanatci_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO etkinlikler (baslik, tarih_saat, ucret, kontenjan, sanatci_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [baslik, tarih_saat, ucret, kontenjan, sanatci_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Etkinlik ekleme hatası:', error);
    res.status(500).json({ message: 'Etkinlik oluşturulamadı.' });
  }
};

// Satıcıya ait etkinliklerin verisi (Analiz)
// Burada join ile o etkinliklere kimlerin "islemler" üzerinden bilet aldığını, yaş ve cinsiyetini çekeceğiz.
exports.getIstatistik = async (req, res) => {
  const { sanatci_id } = req.query;
  try {
    if (!sanatci_id) return res.status(400).json({ message: 'sanatci_id gerekli' });

    // Satıcının etkinliklerini bul
    const etkinliklerRes = await pool.query('SELECT * FROM etkinlikler WHERE sanatci_id = $1 ORDER BY tarih_saat DESC', [sanatci_id]);
    const etkinlikler = etkinliklerRes.rows;

    // Etkinliklerin analizi için SQL sorgusu
    const analizQuery = `
      SELECT 
        et.id AS etkinlik_id,
        et.baslik,
        COUNT(i.id) AS satilan_bilet_sayisi,
        ROUND(AVG(k.yas)) AS yas_ortalamasi,
        SUM(CASE WHEN k.cinsiyet = 'Kadin' THEN 1 ELSE 0 END) AS kadin_uye_sayisi,
        SUM(CASE WHEN k.cinsiyet = 'Erkek' THEN 1 ELSE 0 END) AS erkek_uye_sayisi,
        SUM(CASE WHEN k.cinsiyet = 'Diger' THEN 1 ELSE 0 END) AS diger_uye_sayisi
      FROM etkinlikler et
      LEFT JOIN islemler i ON i.etkinlik_id = et.id
      LEFT JOIN kullanicilar k ON i.kullanici_id = k.id
      WHERE et.sanatci_id = $1
      GROUP BY et.id, et.baslik
    `;
    const analizRes = await pool.query(analizQuery, [sanatci_id]);

    res.json({
      etkinlikler: etkinlikler,
      analiz: analizRes.rows
    });

  } catch (error) {
    console.error('İstatistik getirme hatası:', error);
    res.status(500).json({ message: 'İstatistikler alınamadı.' });
  }
};
