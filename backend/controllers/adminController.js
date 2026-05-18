const pool = require('../db');

// --- Dashboard ---
exports.getStats = async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM kullanicilar');
    const artworksCount = await pool.query('SELECT COUNT(*) FROM eserler');
    const eventsCount = await pool.query('SELECT COUNT(*) FROM etkinlikler');
    const transactionsCount = await pool.query("SELECT COUNT(*) FROM islemler WHERE durum != 'İptal Edildi'");
    const cancelledCount = await pool.query("SELECT COUNT(*) FROM islemler WHERE durum = 'İptal Edildi'");

    // Toplam gelir
    const revenueRes = await pool.query(
      "SELECT COALESCE(SUM(toplam_tutar), 0) AS toplam FROM islemler WHERE durum != 'İptal Edildi'"
    );

    // Son 5 işlem
    const recentTransactions = await pool.query(`
      SELECT i.*, k.ad_soyad, e.baslik as eser_basligi, et.baslik as etkinlik_basligi
      FROM islemler i
      LEFT JOIN kullanicilar k ON i.kullanici_id = k.id
      LEFT JOIN eserler e ON i.eser_id = e.id
      LEFT JOIN etkinlikler et ON i.etkinlik_id = et.id
      ORDER BY i.islem_tarihi DESC LIMIT 5
    `);

    // Ödeme yöntemi dağılımı
    const odemeRes = await pool.query(`
      SELECT odeme_yontemi, COUNT(*) as sayi
      FROM islemler
      WHERE durum != 'İptal Edildi'
      GROUP BY odeme_yontemi
      ORDER BY sayi DESC
    `);

    // Eser bazında: favori sayısı, yorum sayısı
    const eserStatsRes = await pool.query(`
      SELECT
        e.id,
        e.baslik,
        e.fiyat,
        COALESCE(COUNT(DISTINCT f.kullanici_id), 0) AS favori_sayisi,
        COALESCE(COUNT(DISTINCT y.id), 0) AS yorum_sayisi,
        COALESCE(COUNT(DISTINCT i.id), 0) AS satis_sayisi,
        COALESCE(ROUND(AVG(y.puan)::numeric, 1), 0) AS ort_puan
      FROM eserler e
      LEFT JOIN favoriler f ON f.eser_id = e.id
      LEFT JOIN yorumlar y ON y.eser_id = e.id
      LEFT JOIN islemler i ON i.eser_id = e.id AND i.durum != 'İptal Edildi'
      GROUP BY e.id, e.baslik, e.fiyat
      ORDER BY favori_sayisi DESC, yorum_sayisi DESC
      LIMIT 5
    `);

    // Etkinlik bazında: doluluk oranı, ortalama puan, toplam rezervasyon
    const etkinlikStatsRes = await pool.query(`
      SELECT
        et.id,
        et.baslik,
        et.ucret,
        et.kontenjan AS kalan_kontenjan,
        COALESCE(SUM(i.katilimci_sayisi), 0) AS toplam_katilimci,
        COALESCE(COUNT(DISTINCT i.id), 0) AS rezervasyon_sayisi,
        COALESCE(ROUND(AVG(y.puan)::numeric, 1), 0) AS ort_puan,
        COALESCE(COUNT(DISTINCT y.id), 0) AS yorum_sayisi
      FROM etkinlikler et
      LEFT JOIN islemler i ON i.etkinlik_id = et.id AND i.durum != 'İptal Edildi'
      LEFT JOIN yorumlar y ON y.etkinlik_id = et.id
      GROUP BY et.id, et.baslik, et.ucret, et.kontenjan
      ORDER BY rezervasyon_sayisi DESC
      LIMIT 5
    `);

    // Son 30 günlük günlük gelir trendi
    const gelirTrendi = await pool.query(`
      SELECT
        DATE(islem_tarihi) AS gun,
        SUM(toplam_tutar) AS gunluk_gelir,
        COUNT(*) AS islem_sayisi
      FROM islemler
      WHERE durum != 'İptal Edildi'
        AND islem_tarihi >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(islem_tarihi)
      ORDER BY gun ASC
    `);

    res.json({
      users: parseInt(usersCount.rows[0].count),
      artworks: parseInt(artworksCount.rows[0].count),
      events: parseInt(eventsCount.rows[0].count),
      transactions: parseInt(transactionsCount.rows[0].count),
      cancelledTransactions: parseInt(cancelledCount.rows[0].count),
      toplamGelir: parseFloat(revenueRes.rows[0].toplam),
      recentTransactions: recentTransactions.rows,
      odemeYontemiDagilimi: odemeRes.rows,
      topEserler: eserStatsRes.rows,
      etkinlikIstatistikleri: etkinlikStatsRes.rows,
      gelirTrendi: gelirTrendi.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Users ---
exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, ad_soyad, email, rol FROM kullanicilar ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;
  try {
    await pool.query('UPDATE kullanicilar SET rol = $1 WHERE id = $2', [rol, id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// --- Artists ---
exports.getArtists = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sanatcilar ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.addArtist = async (req, res) => {
  const { ad, biyografi } = req.body;
  try {
    const result = await pool.query('INSERT INTO sanatcilar (ad, biyografi) VALUES ($1, $2) RETURNING *', [ad, biyografi]);
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteArtist = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM sanatcilar WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// --- Artworks ---
exports.getArtworks = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, s.ad as sanatci_ad 
      FROM eserler e 
      LEFT JOIN sanatcilar s ON e.sanatci_id = s.id 
      ORDER BY e.id DESC
    `);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.addArtwork = async (req, res) => {
  const { sanatci_id, baslik, aciklama, fiyat, gorsel_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO eserler (sanatci_id, baslik, aciklama, fiyat, gorsel_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [sanatci_id, baslik, aciklama, fiyat, gorsel_url]
    );
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteArtwork = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM eserler WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// --- Events ---
exports.getEvents = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM etkinlikler ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.addEvent = async (req, res) => {
  const { baslik, tarih_saat, ucret, kontenjan } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO etkinlikler (baslik, tarih_saat, ucret, kontenjan) VALUES ($1, $2, $3, $4) RETURNING *',
      [baslik, tarih_saat, ucret, kontenjan]
    );
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM etkinlikler WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// --- Coupons ---
exports.getCoupons = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM kuponlar ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.addCoupon = async (req, res) => {
  const { kod, indirim_yuzdesi } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO kuponlar (kod, indirim_yuzdesi) VALUES ($1, $2) RETURNING *',
      [kod, indirim_yuzdesi]
    );
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteCoupon = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM kuponlar WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// --- Transactions ---
exports.getTransactions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, k.ad_soyad, e.baslik as eser_basligi, et.baslik as etkinlik_basligi, c.kod as kupon_kodu
      FROM islemler i
      LEFT JOIN kullanicilar k ON i.kullanici_id = k.id
      LEFT JOIN eserler e ON i.eser_id = e.id
      LEFT JOIN etkinlikler et ON i.etkinlik_id = et.id
      LEFT JOIN kuponlar c ON i.kupon_id = c.id
      ORDER BY i.islem_tarihi DESC
    `);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateTransactionStatus = async (req, res) => {
  const { id } = req.params;
  const { durum } = req.body;
  try {
    await pool.query('UPDATE islemler SET durum = $1 WHERE id = $2', [durum, id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// --- Reviews ---
exports.getReviews = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT y.*, k.ad_soyad, e.baslik as eser_basligi, et.baslik as etkinlik_basligi
      FROM yorumlar y
      LEFT JOIN kullanicilar k ON y.kullanici_id = k.id
      LEFT JOIN eserler e ON y.eser_id = e.id
      LEFT JOIN etkinlikler et ON y.etkinlik_id = et.id
      ORDER BY y.tarih DESC
    `);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateReviewAdminReply = async (req, res) => {
  const { id } = req.params;
  const { admin_yaniti } = req.body;
  try {
    await pool.query('UPDATE yorumlar SET admin_yaniti = $1 WHERE id = $2', [admin_yaniti, id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteReview = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM yorumlar WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// --- Support Tickets ---
exports.getSupportTickets = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, k.ad_soyad 
      FROM destek_talepleri d
      LEFT JOIN kullanicilar k ON d.kullanici_id = k.id
      ORDER BY d.id DESC
    `);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateSupportTicket = async (req, res) => {
  const { id } = req.params;
  const { durum, admin_yaniti } = req.body;
  try {
    await pool.query('UPDATE destek_talepleri SET durum = $1, admin_yaniti = $2 WHERE id = $3', [durum, admin_yaniti, id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
