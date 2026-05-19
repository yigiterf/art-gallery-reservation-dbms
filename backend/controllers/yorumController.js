const pool = require('../db');

// Bir eserin yorumlarını getir (sahip yanıtı dahil)
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

// Bir etkinliğin yorumlarını getir (sahip yanıtı dahil)
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

// Yorum ekle (yalnızca giriş yapmış kullanıcılar)
exports.addYorum = async (req, res) => {
  const { kullanici_id, eser_id, etkinlik_id, puan, metin } = req.body;

  // Giriş zorunluluğu
  if (!kullanici_id) {
    return res.status(401).json({ error: 'Yorum yapabilmek için giriş yapmalısınız.' });
  }

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
      dogrulanmis = true;
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

// Sahip yanıtı ekle/güncelle (eser/etkinlik sahibi tarafından)
exports.addSahipYaniti = async (req, res) => {
  const { id } = req.params;
  const { sahip_yaniti, kullanici_id } = req.body;
  try {
    // Yorumun bu kullanıcıya ait esere/etkinliğe bağlı olduğunu doğrula
    const yorumRes = await pool.query('SELECT * FROM yorumlar WHERE id = $1', [id]);
    if (yorumRes.rows.length === 0) return res.status(404).json({ error: 'Yorum bulunamadı.' });
    const yorum = yorumRes.rows[0];

    // Satıcı/sanatçı yetkisi kontrolü
    let yetkili = false;
    if (yorum.eser_id) {
      const eserRes = await pool.query(
        `SELECT s.kullanici_id FROM eserler e JOIN sanatcilar s ON e.sanatci_id = s.id WHERE e.id = $1`,
        [yorum.eser_id]
      );
      if (eserRes.rows.length > 0 && Number(eserRes.rows[0].kullanici_id) === Number(kullanici_id)) yetkili = true;
    }
    if (yorum.etkinlik_id) {
      const etkinlikRes = await pool.query(
        `SELECT s.kullanici_id FROM etkinlikler e JOIN sanatcilar s ON e.sanatci_id = s.id WHERE e.id = $1`,
        [yorum.etkinlik_id]
      );
      if (etkinlikRes.rows.length > 0 && Number(etkinlikRes.rows[0].kullanici_id) === Number(kullanici_id)) yetkili = true;
    }

    // Admin her zaman yetkili
    const adminRes = await pool.query('SELECT rol FROM kullanicilar WHERE id = $1', [kullanici_id]);
    if (adminRes.rows.length > 0 && adminRes.rows[0].rol === 'admin') yetkili = true;

    if (!yetkili) return res.status(403).json({ error: 'Bu yoruma yanıt verme yetkiniz yok.' });

    const result = await pool.query(
      'UPDATE yorumlar SET sahip_yaniti = $1, sahip_yaniti_tarihi = NOW() WHERE id = $2 RETURNING *',
      [sahip_yaniti, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
