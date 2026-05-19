-- 7. Hesap Yönetimi
CREATE TABLE kullanicilar (
    id SERIAL PRIMARY KEY,
    ad_soyad VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    sifre_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'kullanici'
);

-- 1. Eserleri İnceleme (Sanatçılar dahil)
CREATE TABLE sanatcilar (
    id SERIAL PRIMARY KEY,
    ad VARCHAR(100) NOT NULL,
    biyografi TEXT
);

CREATE TABLE eserler (
    id SERIAL PRIMARY KEY,
    sanatci_id INTEGER REFERENCES sanatcilar(id) ON DELETE CASCADE,
    baslik VARCHAR(200) NOT NULL,
    aciklama TEXT,
    fiyat DECIMAL(10,2) NOT NULL,
    gorsel_url VARCHAR(255),
    stok INTEGER DEFAULT 1
);

-- 2. Atölye ve Etkinlikleri Görüntüleme
CREATE TABLE etkinlikler (
    id SERIAL PRIMARY KEY,
    baslik VARCHAR(200) NOT NULL,
    tarih_saat TIMESTAMP NOT NULL,
    ucret DECIMAL(10,2) NOT NULL,
    kontenjan INTEGER NOT NULL
);

-- 3. Favorilere Ekleme
CREATE TABLE favoriler (
    kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
    eser_id INTEGER REFERENCES eserler(id) ON DELETE CASCADE,
    PRIMARY KEY (kullanici_id, eser_id)
);

-- 9. İndirim ve Kampanyalar
CREATE TABLE kuponlar (
    id SERIAL PRIMARY KEY,
    kod VARCHAR(50) UNIQUE NOT NULL,
    indirim_yuzdesi INTEGER NOT NULL
);

-- 4, 5, 6, 8. Satın Alma, Rezervasyon ve Takip
CREATE TABLE islemler (
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

-- 12, 13, 14, 15. Yorum, Değerlendirme, Yanıt
CREATE TABLE yorumlar (
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

-- 10. Müşteri Destek
CREATE TABLE destek_talepleri (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER REFERENCES kullanicilar(id),
    konu VARCHAR(150) NOT NULL,
    mesaj TEXT NOT NULL,
    durum VARCHAR(50) DEFAULT 'Açık',
    admin_yaniti TEXT
);

-- 11. Eser ve Etkinlik Karşılaştırma
CREATE TABLE karsilastirmalar (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
    tip VARCHAR(20) NOT NULL,
    oge_idler JSONB NOT NULL
);
