const pool = require('../db');

// İşlem oluştur (kupon destekli)
exports.createIslem = async (req, res) => {
  const { kullanici_id, eser_id, etkinlik_id, katilimci_sayisi, toplam_tutar, odeme_yontemi, kupon_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO islemler 
        (kullanici_id, eser_id, etkinlik_id, katilimci_sayisi, toplam_tutar, odeme_yontemi, kupon_id, durum) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Onaylandı') 
       RETURNING *`,
      [kullanici_id, eser_id || null, etkinlik_id || null, katilimci_sayisi || 1, toplam_tutar, odeme_yontemi || 'Kredi Kartı', kupon_id || null]
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

// Kullanıcı işlemlerini getir
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

// Rezervasyon iptal et
exports.cancelIslem = async (req, res) => {
  const { id } = req.params;
  try {
    const islemRes = await pool.query('SELECT * FROM islemler WHERE id = $1', [id]);
    if (islemRes.rows.length === 0) {
      return res.status(404).json({ message: 'İşlem bulunamadı.' });
    }
    const islem = islemRes.rows[0];

    if (islem.durum === 'İptal Edildi') {
      return res.status(400).json({ message: 'Bu işlem zaten iptal edilmiş.' });
    }

    await pool.query('UPDATE islemler SET durum = $1 WHERE id = $2', ['İptal Edildi', id]);

    // Etkinlik rezervasyonuysa kontenjanı geri ver
    if (islem.etkinlik_id) {
      await pool.query(
        'UPDATE etkinlikler SET kontenjan = kontenjan + $1 WHERE id = $2',
        [islem.katilimci_sayisi || 1, islem.etkinlik_id]
      );
    }

    res.json({ message: 'Rezervasyon başarıyla iptal edildi.' });
  } catch (error) {
    console.error('İptal hatası:', error);
    res.status(500).json({ message: 'İptal işlemi gerçekleştirilemedi.' });
  }
};

// Rezervasyonu güncelle (katılımcı sayısı)
exports.updateIslem = async (req, res) => {
  const { id } = req.params;
  const { yeni_katilimci_sayisi } = req.body;
  try {
    const islemRes = await pool.query('SELECT * FROM islemler WHERE id = $1', [id]);
    if (islemRes.rows.length === 0) {
      return res.status(404).json({ message: 'İşlem bulunamadı.' });
    }
    const islem = islemRes.rows[0];

    if (islem.durum === 'İptal Edildi') {
      return res.status(400).json({ message: 'İptal edilmiş bir rezervasyon güncellenemez.' });
    }

    if (!islem.etkinlik_id) {
      return res.status(400).json({ message: 'Sadece etkinlik rezervasyonları güncellenebilir.' });
    }

    const fark = yeni_katilimci_sayisi - islem.katilimci_sayisi;

    // Kontenjan kontrolü (arttırılacaksa)
    if (fark > 0) {
      const etkinlikRes = await pool.query('SELECT kontenjan FROM etkinlikler WHERE id = $1', [islem.etkinlik_id]);
      const mevcutKontenjan = etkinlikRes.rows[0]?.kontenjan || 0;
      if (fark > mevcutKontenjan) {
        return res.status(400).json({ message: `Yeterli kontenjan yok. Mevcut boş yer: ${mevcutKontenjan}` });
      }
    }

    // Etkinlik fiyatını hesapla
    const etkinlikRes = await pool.query('SELECT ucret FROM etkinlikler WHERE id = $1', [islem.etkinlik_id]);
    const birimFiyat = parseFloat(etkinlikRes.rows[0]?.ucret) || 0;
    const yeniToplam = birimFiyat * yeni_katilimci_sayisi;

    await pool.query(
      'UPDATE islemler SET katilimci_sayisi = $1, toplam_tutar = $2 WHERE id = $3',
      [yeni_katilimci_sayisi, yeniToplam, id]
    );

    // Kontenjanı güncelle
    await pool.query(
      'UPDATE etkinlikler SET kontenjan = kontenjan - $1 WHERE id = $2',
      [fark, islem.etkinlik_id]
    );

    res.json({ message: 'Rezervasyon güncellendi.', yeni_tutar: yeniToplam });
  } catch (error) {
    console.error('Güncelleme hatası:', error);
    res.status(500).json({ message: 'Güncelleme gerçekleştirilemedi.' });
  }
};

// Kupon doğrula
exports.validateKupon = async (req, res) => {
  const { kod } = req.params;
  try {
    const result = await pool.query('SELECT * FROM kuponlar WHERE kod = $1', [kod.toUpperCase()]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Geçersiz kupon kodu.' });
    }
    res.json({ indirim_yuzdesi: result.rows[0].indirim_yuzdesi, id: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ message: 'Kupon doğrulanamadı.' });
  }
};
