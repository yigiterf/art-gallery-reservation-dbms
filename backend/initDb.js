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
          gorsel_url VARCHAR(255),
          stok INTEGER DEFAULT 1
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

      ALTER TABLE sanatcilar ADD COLUMN IF NOT EXISTS kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE;
      ALTER TABLE eserler ADD COLUMN IF NOT EXISTS stok INTEGER DEFAULT 1;
      
      ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS yas INTEGER;
      ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS cinsiyet VARCHAR(20);
      ALTER TABLE etkinlikler ADD COLUMN IF NOT EXISTS sanatci_id INTEGER REFERENCES sanatcilar(id) ON DELETE CASCADE;

      -- Kupon kısıtlamaları (yaş, cinsiyet, satıcı bazlı)
      ALTER TABLE kuponlar ADD COLUMN IF NOT EXISTS min_yas INTEGER;
      ALTER TABLE kuponlar ADD COLUMN IF NOT EXISTS max_yas INTEGER;
      ALTER TABLE kuponlar ADD COLUMN IF NOT EXISTS cinsiyet_kisitlamasi VARCHAR(20);
      ALTER TABLE kuponlar ADD COLUMN IF NOT EXISTS sanatci_id INTEGER REFERENCES sanatcilar(id) ON DELETE CASCADE;
      ALTER TABLE kuponlar ADD COLUMN IF NOT EXISTS hedef_turu VARCHAR(20) DEFAULT 'tum';
      ALTER TABLE kuponlar ADD COLUMN IF NOT EXISTS aciklama TEXT;

      -- Yorum sahibi yanıtı
      ALTER TABLE yorumlar ADD COLUMN IF NOT EXISTS sahip_yaniti TEXT;
      ALTER TABLE yorumlar ADD COLUMN IF NOT EXISTS sahip_yaniti_tarihi TIMESTAMP;
    `);
    
    console.log('Veritabanı tabloları başarıyla ayarlandı.');
  } catch (error) {
    console.error('Veritabanı oluşturulurken hata:', error);
  }
};

module.exports = initDb;
