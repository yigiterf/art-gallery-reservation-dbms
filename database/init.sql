-- 7. Hesap Yönetimi
CREATE TABLE kullanicilar (
    id SERIAL PRIMARY KEY,
    ad_soyad VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    sifre_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'kullanici' -- 'kullanici' veya 'admin'
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
    gorsel_url VARCHAR(255)
);

-- 2. Atölye ve Etkinlikleri Görüntüleme
CREATE TABLE etkinlikler (
    id SERIAL PRIMARY KEY,
    baslik VARCHAR(200) NOT NULL,
    tarih_saat TIMESTAMP NOT NULL,
    ucret DECIMAL(10,2) NOT NULL,
    kontenjan INTEGER NOT NULL
);

-- 3. Favorilere Ekleme (Sadece eserler için)
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

-- 4, 5, 6 ve 8. Satın Alma, Rezervasyon ve Takip
CREATE TABLE islemler (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER REFERENCES kullanicilar(id),
    eser_id INTEGER REFERENCES eserler(id), -- Eser satın alınıyorsa dolu
    etkinlik_id INTEGER REFERENCES etkinlikler(id), -- Rezervasyon yapılıyorsa dolu
    kupon_id INTEGER REFERENCES kuponlar(id), -- İndirim kullanıldıysa
    katilimci_sayisi INTEGER DEFAULT 1, -- Etkinlik rezervasyonu için
    toplam_tutar DECIMAL(10,2) NOT NULL,
    odeme_yontemi VARCHAR(50),
    durum VARCHAR(50) DEFAULT 'Onaylandı', -- 'İptal Edildi', 'Tamamlandı'
    islem_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12, 13, 14 ve 15. Yorum, Değerlendirme, Yanıt ve Güvenilirlik
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
    durum VARCHAR(50) DEFAULT 'Açık', -- 'Yanıtlandı', 'Kapalı'
    admin_yaniti TEXT
);

-- 11. Eser ve Etkinlik Karşılaştırma
CREATE TABLE karsilastirmalar (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
    tip VARCHAR(20) NOT NULL, -- 'eser' veya 'etkinlik'
    oge_idler JSONB NOT NULL
);

-- Dummy Admin User
INSERT INTO kullanicilar (ad_soyad, email, sifre_hash, rol) VALUES ('Admin User', 'admin@gallery.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
