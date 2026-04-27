const pool = require('./db');

const initDb = async () => {
  try {
    console.log('Veritabanı tabloları kontrol ediliyor ve (gerekirse) oluşturuluyor...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kullanicilar (
          id SERIAL PRIMARY KEY,
          ad_soyad VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          sifre_hash VARCHAR(255) NOT NULL,
          rol VARCHAR(20) DEFAULT 'kullanici'
      );

      CREATE TABLE IF NOT EXISTS sanatcilar (
          id SERIAL PRIMARY KEY,
          ad VARCHAR(100) NOT NULL,
          biyografi TEXT
      );

      CREATE TABLE IF NOT EXISTS eserler (
          id SERIAL PRIMARY KEY,
          sanatci_id INTEGER REFERENCES sanatcilar(id) ON DELETE CASCADE,
          baslik VARCHAR(200) NOT NULL,
          aciklama TEXT,
          fiyat DECIMAL(10,2) NOT NULL,
          gorsel_url VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS etkinlikler (
          id SERIAL PRIMARY KEY,
          baslik VARCHAR(200) NOT NULL,
          tarih_saat TIMESTAMP NOT NULL,
          ucret DECIMAL(10,2) NOT NULL,
          kontenjan INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS favoriler (
          kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
          eser_id INTEGER REFERENCES eserler(id) ON DELETE CASCADE,
          PRIMARY KEY (kullanici_id, eser_id)
      );

      CREATE TABLE IF NOT EXISTS kuponlar (
          id SERIAL PRIMARY KEY,
          kod VARCHAR(50) UNIQUE NOT NULL,
          indirim_yuzdesi INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS islemler (
          id SERIAL PRIMARY KEY,
          kullanici_id INTEGER REFERENCES kullanicilar(id),
          eser_id INTEGER REFERENCES eserler(id),
          etkinlik_id INTEGER REFERENCES etkinlikler(id),
          kupon_id INTEGER REFERENCES kuponlar(id),
          katilimci_sayisi INTEGER DEFAULT 1,
          toplam_tutar DECIMAL(10,2) NOT NULL,
          odeme_yontemi VARCHAR(50),
          durum VARCHAR(50) DEFAULT 'Onaylandı',
          islem_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS yorumlar (
          id SERIAL PRIMARY KEY,
          kullanici_id INTEGER REFERENCES kullanicilar(id) NOT NULL,
          eser_id INTEGER REFERENCES eserler(id), 
          etkinlik_id INTEGER REFERENCES etkinlikler(id),
          puan INTEGER CHECK (puan >= 1 AND puan <= 5),
          metin TEXT NOT NULL,
          admin_yaniti TEXT,
          faydali_oy_sayisi INTEGER DEFAULT 0,
          dogrulanmis_satin_alma BOOLEAN DEFAULT FALSE,
          tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS destek_talepleri (
          id SERIAL PRIMARY KEY,
          kullanici_id INTEGER REFERENCES kullanicilar(id),
          konu VARCHAR(150) NOT NULL,
          mesaj TEXT NOT NULL,
          durum VARCHAR(50) DEFAULT 'Açık',
          admin_yaniti TEXT
      );

      CREATE TABLE IF NOT EXISTS karsilastirmalar (
          id SERIAL PRIMARY KEY,
          kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
          tip VARCHAR(20) NOT NULL,
          oge_idler JSONB NOT NULL
      );
    `);
    
    console.log('Veritabanı tabloları başarıyla ayarlandı.');
  } catch (error) {
    console.error('Veritabanı oluşturulurken hata:', error);
  }
};

module.exports = initDb;
