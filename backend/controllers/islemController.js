const pool = require('../db');

// İşlem oluştur (kupon destekli)
exports.createIslem = async (req, res) => {
  const { kullanici_id, eser_id, etkinlik_id, katilimci_sayisi, toplam_tutar, odeme_yontemi, kupon_id } = req.body;
  try {
    // Eğer eserse stok kontrolü yap ve kendi eseri olup olmadığını kontrol et
    if (eser_id) {
        const eserRes = await pool.query(`
          SELECT e.stok, s.kullanici_id AS satici_kullanici_id 
          FROM eserler e 
          LEFT JOIN sanatcilar s ON e.sanatci_id = s.id 
          WHERE e.id = $1
        `, [eser_id]);
        
        if (eserRes.rows.length === 0) {
            return res.status(404).json({ message: 'Eser bulunamadı.' });
        }
        if (Number(eserRes.rows[0].satici_kullanici_id) === Number(kullanici_id)) {
            return res.status(400).json({ message: 'Kendi eserinizi satın alamazsınız.' });
        }
        if (eserRes.rows[0].stok <= 0) {
            return res.status(400).json({ message: 'Bu eser tükenmiştir.' });
        }
    }

    // Eğer etkinlikse kontenjan kontrolü ve kendi etkinliği olup olmadığını kontrol et
    if (etkinlik_id) {
        const etkinlikRes = await pool.query(`
          SELECT e.kontenjan, s.kullanici_id AS satici_kullanici_id 
          FROM etkinlikler e 
          LEFT JOIN sanatcilar s ON e.sanatci_id = s.id 
          WHERE e.id = $1
        `, [etkinlik_id]);
        
        if (etkinlikRes.rows.length === 0) {
            return res.status(404).json({ message: 'Etkinlik bulunamadı.' });
        }
        if (Number(etkinlikRes.rows[0].satici_kullanici_id) === Number(kullanici_id)) {
            return res.status(400).json({ message: 'Kendi etkinliğinize rezervasyon yapamazsınız.' });
        }
        if (etkinlikRes.rows[0].kontenjan < (katilimci_sayisi || 1)) {
            return res.status(400).json({ message: 'Bu etkinlikte yeterli kontenjan yoktur.' });
        }
    }

    const result = await pool.query(
      `INSERT INTO islemler 
        (kullanici_id, eser_id, etkinlik_id, katilimci_sayisi, toplam_tutar, odeme_yontemi, kupon_id, durum) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Bekliyor') 
       RETURNING *`,
      [kullanici_id, eser_id || null, etkinlik_id || null, katilimci_sayisi || 1, toplam_tutar, odeme_yontemi || 'Kredi Kartı', kupon_id || null]
    );

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

    // Etkinlik rezervasyonuysa ve onaylandıysa kontenjanı geri ver
    if (islem.etkinlik_id && islem.durum === 'Onaylandı') {
      await pool.query(
        'UPDATE etkinlikler SET kontenjan = kontenjan + $1 WHERE id = $2',
        [islem.katilimci_sayisi || 1, islem.etkinlik_id]
      );
    }
    if (islem.eser_id && islem.durum === 'Onaylandı') {
      await pool.query('UPDATE eserler SET stok = stok + 1 WHERE id = $1', [islem.eser_id]);
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

    if (islem.durum === 'Onaylandı') {
      if (fark > 0) {
        const etkinlikRes = await pool.query('SELECT kontenjan FROM etkinlikler WHERE id = $1', [islem.etkinlik_id]);
        const mevcutKontenjan = etkinlikRes.rows[0]?.kontenjan || 0;
        if (fark > mevcutKontenjan) {
          return res.status(400).json({ message: `Yeterli kontenjan yok. Mevcut boş yer: ${mevcutKontenjan}` });
        }
      }
      await pool.query('UPDATE etkinlikler SET kontenjan = kontenjan - $1 WHERE id = $2', [fark, islem.etkinlik_id]);
    } else if (islem.durum === 'Bekliyor') {
      const etkinlikRes = await pool.query('SELECT kontenjan FROM etkinlikler WHERE id = $1', [islem.etkinlik_id]);
      if (yeni_katilimci_sayisi > etkinlikRes.rows[0]?.kontenjan) {
        return res.status(400).json({ message: `Yeterli kontenjan yok. (Mevcut: ${etkinlikRes.rows[0].kontenjan})` });
      }
    }

    const etkinlikRes = await pool.query('SELECT ucret FROM etkinlikler WHERE id = $1', [islem.etkinlik_id]);
    const birimFiyat = parseFloat(etkinlikRes.rows[0]?.ucret) || 0;
    const yeniToplam = birimFiyat * yeni_katilimci_sayisi;

    await pool.query(
      'UPDATE islemler SET katilimci_sayisi = $1, toplam_tutar = $2 WHERE id = $3',
      [yeni_katilimci_sayisi, yeniToplam, id]
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

// Satıcıya ait işlemleri getir (Eser ve Etkinlikler)
exports.getIslemlerBySatici = async (req, res) => {
  const { saticiId } = req.params;
  try {
    const query = `
      SELECT 
        i.*,
        e.baslik AS eser_baslik,
        et.baslik AS etkinlik_baslik,
        k.ad_soyad AS musteri_adi
      FROM islemler i
      LEFT JOIN eserler e ON i.eser_id = e.id
      LEFT JOIN etkinlikler et ON i.etkinlik_id = et.id
      LEFT JOIN kullanicilar k ON i.kullanici_id = k.id
      WHERE e.sanatci_id = $1 OR et.sanatci_id = $1
      ORDER BY i.islem_tarihi DESC
    `;
    const result = await pool.query(query, [saticiId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Satıcı işlemleri getirme hatası:', error);
    res.status(500).json({ message: 'Siparişler alınamadı.' });
  }
};

// İşlem durumunu güncelle (Satıcı tarafından)
exports.updateIslemDurum = async (req, res) => {
  const { id } = req.params;
  const { durum } = req.body;
  try {
    const islemRes = await pool.query('SELECT * FROM islemler WHERE id = $1', [id]);
    if (islemRes.rows.length === 0) return res.status(404).json({ message: 'İşlem bulunamadı.' });
    const islem = islemRes.rows[0];

    // Onaylandığında stok / kontenjan düşürme
    if (durum === 'Onaylandı' && islem.durum !== 'Onaylandı') {
        if (islem.etkinlik_id) {
            const etkinlikRes = await pool.query('SELECT kontenjan FROM etkinlikler WHERE id = $1', [islem.etkinlik_id]);
            if (etkinlikRes.rows[0].kontenjan < (islem.katilimci_sayisi || 1)) {
                return res.status(400).json({ message: 'Yeterli kontenjan yok, işlem onaylanamaz.' });
            }
            await pool.query('UPDATE etkinlikler SET kontenjan = kontenjan - $1 WHERE id = $2', [islem.katilimci_sayisi || 1, islem.etkinlik_id]);
        }
        if (islem.eser_id) {
            const eserRes = await pool.query('SELECT stok FROM eserler WHERE id = $1', [islem.eser_id]);
            if (eserRes.rows[0].stok <= 0) {
                return res.status(400).json({ message: 'Bu eser zaten satılmış.' });
            }
            await pool.query('UPDATE eserler SET stok = stok - 1 WHERE id = $1', [islem.eser_id]);
        }
    }

    // Eğer daha önce onaylanmış işlem iptal/reddediliyorsa stok iade et
    if ((durum === 'İptal Edildi' || durum === 'Reddedildi') && islem.durum === 'Onaylandı') {
       if (islem.etkinlik_id) {
           await pool.query('UPDATE etkinlikler SET kontenjan = kontenjan + $1 WHERE id = $2', [islem.katilimci_sayisi || 1, islem.etkinlik_id]);
       }
       if (islem.eser_id) {
           await pool.query('UPDATE eserler SET stok = stok + 1 WHERE id = $1', [islem.eser_id]);
       }
    }

    await pool.query('UPDATE islemler SET durum = $1 WHERE id = $2', [durum, id]);
    res.json({ message: 'İşlem durumu güncellendi.' });
  } catch (error) {
    res.status(500).json({ message: 'İşlem durumu güncellenemedi.' });
  }
};

// Müşteri oturum (tarih) değiştir
exports.changeEtkinlikSession = async (req, res) => {
  const { id } = req.params;
  const { yeni_etkinlik_id } = req.body;
  
  try {
    const islemRes = await pool.query('SELECT * FROM islemler WHERE id = $1', [id]);
    if (islemRes.rows.length === 0) return res.status(404).json({ message: 'İşlem bulunamadı.' });
    const islem = islemRes.rows[0];

    if (islem.durum === 'İptal Edildi') return res.status(400).json({ message: 'İptal edilmiş işlem değiştirilemez.' });

    const yeniEtkinlikRes = await pool.query('SELECT * FROM etkinlikler WHERE id = $1', [yeni_etkinlik_id]);
    if (yeniEtkinlikRes.rows.length === 0) return res.status(404).json({ message: 'Yeni oturum bulunamadı.' });
    const yeniEtkinlik = yeniEtkinlikRes.rows[0];

    if (yeniEtkinlik.kontenjan < islem.katilimci_sayisi) {
      return res.status(400).json({ message: 'Seçilen oturumda yeterli kontenjan yok.' });
    }

    if (islem.durum === 'Onaylandı') {
      await pool.query('UPDATE etkinlikler SET kontenjan = kontenjan + $1 WHERE id = $2', [islem.katilimci_sayisi, islem.etkinlik_id]);
      await pool.query('UPDATE etkinlikler SET kontenjan = kontenjan - $1 WHERE id = $2', [islem.katilimci_sayisi, yeni_etkinlik_id]);
    }
    
    await pool.query('UPDATE islemler SET etkinlik_id = $1 WHERE id = $2', [yeni_etkinlik_id, id]);

    res.json({ message: 'Rezervasyon oturumu başarıyla değiştirildi.' });
  } catch (error) {
    console.error('Oturum değiştirme hatası:', error);
    res.status(500).json({ message: 'Oturum değiştirilemedi.' });
  }
};
