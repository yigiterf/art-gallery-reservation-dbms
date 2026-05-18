const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'gizli_anahtar_super_guvenli_123';

exports.register = async (req, res) => {
  const { ad_soyad, email, sifre, rol, yas, cinsiyet } = req.body;

  try {
    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM kullanicilar WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const sifre_hash = await bcrypt.hash(sifre, salt);

    // Default rol is 'kullanici' if invalid/empty, allow 'satici'
    let assignedRole = 'kullanici';
    if (rol === 'satici') assignedRole = 'satici';

    const result = await pool.query(
      'INSERT INTO kullanicilar (ad_soyad, email, sifre_hash, rol, yas, cinsiyet) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, ad_soyad, email, rol, yas, cinsiyet',
      [ad_soyad, email, sifre_hash, assignedRole, yas ? parseInt(yas) : null, cinsiyet || null]
    );

    const newUser = result.rows[0];

    let sanatci_id = null;
    // If satıcı, automatically create a sanatcilar record
    if (assignedRole === 'satici') {
      const artRes = await pool.query('INSERT INTO sanatcilar (ad, kullanici_id) VALUES ($1, $2) RETURNING id', [ad_soyad, newUser.id]);
      sanatci_id = artRes.rows[0].id;
    }

    // Generate token
    const token = jwt.sign({ id: newUser.id, rol: newUser.rol, sanatci_id }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ token, user: { ...newUser, sanatci_id } });
  } catch (err) {
    console.error('Kayıt hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası, lütfen tekrar deneyin.' });
  }
};

exports.login = async (req, res) => {
  const { email, sifre, rol } = req.body;
  try {
    const result = await pool.query('SELECT * FROM kullanicilar WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Hatalı e-posta veya şifre.' });
    }

    const user = result.rows[0];

    // Rolü kontrol et (Admin hariç tutarak Müşteri/Satıcı doğrulaması)
    if (rol && user.rol !== 'admin' && user.rol !== rol) {
      return res.status(400).json({ message: 'Seçilen giriş türü ile hesabınızın yetkisi uyuşmuyor.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(sifre, user.sifre_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Hatalı e-posta veya şifre.' });
    }

    // Include sanatci_id if role is satici
    let sanatci_id = null;
    if (user.rol === 'satici') {
      const artistRes = await pool.query('SELECT id FROM sanatcilar WHERE kullanici_id = $1', [user.id]);
      if (artistRes.rows.length > 0) {
        sanatci_id = artistRes.rows[0].id;
      }
    }

    // Generate payload and token
    const token = jwt.sign({ id: user.id, rol: user.rol, sanatci_id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user.id, ad_soyad: user.ad_soyad, email: user.email, rol: user.rol, sanatci_id } });
  } catch (err) {
    console.error('Giriş hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası, lütfen tekrar deneyin.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const result = await pool.query('SELECT id, ad_soyad, email, rol FROM kullanicilar WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    const user = result.rows[0];
    
    let sanatci_id = null;
    if (user.rol === 'satici') {
      const artistRes = await pool.query('SELECT id FROM sanatcilar WHERE kullanici_id = $1', [user.id]);
      if (artistRes.rows.length > 0) {
        sanatci_id = artistRes.rows[0].id;
      }
    }

    res.json({ id: user.id, ad_soyad: user.ad_soyad, email: user.email, rol: user.rol, sanatci_id });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

exports.updateProfile = async (req, res) => {
  const { id } = req.params;
  const { ad_soyad, email } = req.body;
  try {
    // E-posta çakışma kontrolü
    const existing = await pool.query('SELECT id FROM kullanicilar WHERE email = $1 AND id != $2', [email, id]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Bu e-posta başka bir hesapta kullanılıyor.' });
    }
    const result = await pool.query(
      'UPDATE kullanicilar SET ad_soyad = $1, email = $2 WHERE id = $3 RETURNING id, ad_soyad, email, rol',
      [ad_soyad, email, id]
    );
    res.json({ message: 'Profil güncellendi.', user: result.rows[0] });
  } catch (err) {
    console.error('Profil güncelleme hatası:', err);
    res.status(500).json({ message: 'Profil güncellenemedi.' });
  }
};

exports.changePassword = async (req, res) => {
  const { id } = req.params;
  const { eski_sifre, yeni_sifre } = req.body;
  try {
    const result = await pool.query('SELECT sifre_hash FROM kullanicilar WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    const isMatch = await bcrypt.compare(eski_sifre, result.rows[0].sifre_hash);
    if (!isMatch) return res.status(400).json({ message: 'Mevcut şifre yanlış.' });

    const salt = await bcrypt.genSalt(10);
    const yeni_hash = await bcrypt.hash(yeni_sifre, salt);
    await pool.query('UPDATE kullanicilar SET sifre_hash = $1 WHERE id = $2', [yeni_hash, id]);
    res.json({ message: 'Şifre başarıyla değiştirildi.' });
  } catch (err) {
    console.error('Şifre değiştirme hatası:', err);
    res.status(500).json({ message: 'Şifre değiştirilemedi.' });
  }
};
