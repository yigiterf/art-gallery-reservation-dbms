const pool = require('../db');

// Tüm etkinlikleri getir
exports.getAllEtkinlikler = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, s.ad AS sanatci_adi 
      FROM etkinlikler e 
      LEFT JOIN sanatcilar s ON e.sanatci_id = s.id 
      ORDER BY e.tarih_saat ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Etkinlikleri getirme hatası:', error);
    res.status(500).json({ message: 'Etkinlikler alınamadı.' });
  }
};

// Etkinlik Oluştur
exports.createEtkinlik = async (req, res) => {
  const { baslik, tarih_saat_listesi, ucret, kontenjan, sanatci_id, tarih_saat } = req.body;
  try {
    // Geriye dönük uyumluluk veya tekli tarih için
    const tarihler = tarih_saat_listesi || (tarih_saat ? [tarih_saat] : []);
    
    if (tarihler.length === 0) {
      return res.status(400).json({ message: 'En az bir tarih/saat seçilmelidir.' });
    }

    const insertedRows = [];
    for (const tarih of tarihler) {
        const result = await pool.query(
          'INSERT INTO etkinlikler (baslik, tarih_saat, ucret, kontenjan, sanatci_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [baslik, tarih, ucret, kontenjan, sanatci_id]
        );
        insertedRows.push(result.rows[0]);
    }
    
    res.status(201).json(insertedRows[0]); // Sadece ilkini dönüyoruz uyumluluk için
  } catch (error) {
    console.error('Etkinlik ekleme hatası:', error);
    res.status(500).json({ message: 'Etkinlik oluşturulamadı. Detay: ' + (error.stack || JSON.stringify(error) || error) });
  }
};

// Satıcıya ait etkinlikleri getir (Etkinliklerim Tab)
exports.getEtkinliklerim = async (req, res) => {
  const { sanatci_id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM etkinlikler WHERE sanatci_id = $1 ORDER BY tarih_saat DESC', [sanatci_id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Etkinlikler alınamadı.' });
  }
};

// Etkinlik Kontenjan Güncelle
exports.updateKontenjan = async (req, res) => {
  const { id } = req.params;
  const { kontenjan } = req.body;
  try {
    await pool.query('UPDATE etkinlikler SET kontenjan = $1 WHERE id = $2', [kontenjan, id]);
    res.json({ message: 'Kontenjan güncellendi.' });
  } catch (error) {
    res.status(500).json({ message: 'Kontenjan güncellenemedi.' });
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
