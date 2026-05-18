const pool = require('../db');

// Bir eserin yorumlarını getir
exports.getEserYorumlari = async (req, res) => {
  const { eserId } = req.params;
  try {
    const result = await pool.query(
      `SELECT y.*, k.ad_soyad
       FROM yorumlar y
       JOIN kullanicilar k ON y.kullanici_id = k.id
       WHERE y.eser_id = $1
       ORDER BY y.tarih DESC`,
      [eserId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Bir etkinliğin yorumlarını getir
exports.getEtkinlikYorumlari = async (req, res) => {
  const { etkinlikId } = req.params;
  try {
    const result = await pool.query(
      `SELECT y.*, k.ad_soyad
       FROM yorumlar y
       JOIN kullanicilar k ON y.kullanici_id = k.id
       WHERE y.etkinlik_id = $1
       ORDER BY y.tarih DESC`,
      [etkinlikId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Yorum ekle
exports.addYorum = async (req, res) => {
  const { kullanici_id, eser_id, etkinlik_id, puan, metin } = req.body;
  try {
    let dogrulanmis = false;

    if (eser_id) {
      // Eser yorumu: satın almış olmak sadece rozet verir, zorunlu değil
      const check = await pool.query(
        "SELECT id FROM islemler WHERE kullanici_id = $1 AND eser_id = $2 AND durum != 'İptal Edildi'",
        [kullanici_id, eser_id]
      );
      dogrulanmis = check.rows.length > 0;

    } else if (etkinlik_id) {
      // Etkinlik yorumu: katılım ZORUNLU — katılmadan yorum yapılamaz
      const check = await pool.query(
        "SELECT id FROM islemler WHERE kullanici_id = $1 AND etkinlik_id = $2 AND durum != 'İptal Edildi'",
        [kullanici_id, etkinlik_id]
      );

      if (check.rows.length === 0) {
        return res.status(403).json({
          error: 'Bu etkinliğe yorum yapabilmek için etkinliğe rezervasyon yapmış ve katılmış olmanız gerekmektedir.'
        });
      }
      dogrulanmis = true; // Etkinliğe katılan herkes doğrulanmış sayılır
    } else {
      return res.status(400).json({ error: 'Eser veya etkinlik belirtilmesi zorunludur.' });
    }

    const result = await pool.query(
      `INSERT INTO yorumlar (kullanici_id, eser_id, etkinlik_id, puan, metin, dogrulanmis_satin_alma)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [kullanici_id, eser_id || null, etkinlik_id || null, puan, metin, dogrulanmis]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Yorumu faydalı bul (oy ver)
exports.voteYorum = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE yorumlar SET faydali_oy_sayisi = faydali_oy_sayisi + 1 WHERE id = $1 RETURNING faydali_oy_sayisi',
      [id]
    );
    res.json({ faydali_oy_sayisi: result.rows[0].faydali_oy_sayisi });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
