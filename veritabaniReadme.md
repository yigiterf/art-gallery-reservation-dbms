
Kullanılacak teknolojiler
Reactjs 
Nodejs
TailwindCSS
PostgreSQL






-- 7. Hesap Yönetimi [cite: 25, 26, 27]
CREATE TABLE kullanicilar (
    id SERIAL PRIMARY KEY,
    ad_soyad VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    sifre_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'kullanici' -- 'kullanici' veya 'admin'
);

-- 1. Eserleri İnceleme (Sanatçılar dahil) [cite: 6, 9]
CREATE TABLE sanatcilar (
    id SERIAL PRIMARY KEY,
    ad VARCHAR(100) NOT NULL,
    biyografi TEXT
);

CREATE TABLE eserler (
    id SERIAL PRIMARY KEY,
    sanatci_id INTEGER REFERENCES sanatcilar(id) ON DELETE CASCADE,
    baslik VARCHAR(200) NOT NULL,
    aciklama TEXT, [cite: 9]
    fiyat DECIMAL(10,2) NOT NULL,
    gorsel_url VARCHAR(255) [cite: 8]
);

-- 2. Atölye ve Etkinlikleri Görüntüleme [cite: 10, 11]
CREATE TABLE etkinlikler (
    id SERIAL PRIMARY KEY,
    baslik VARCHAR(200) NOT NULL,
    tarih_saat TIMESTAMP NOT NULL, [cite: 12]
    ucret DECIMAL(10,2) NOT NULL, [cite: 12]
    kontenjan INTEGER NOT NULL [cite: 12]
);

-- 3. Favorilere Ekleme (Sadece eserler için) [cite: 14, 15]
CREATE TABLE favoriler (
    kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
    eser_id INTEGER REFERENCES eserler(id) ON DELETE CASCADE,
    PRIMARY KEY (kullanici_id, eser_id)
);

-- 9. İndirim ve Kampanyalar [cite: 34, 36]
CREATE TABLE kuponlar (
    id SERIAL PRIMARY KEY,
    kod VARCHAR(50) UNIQUE NOT NULL,
    indirim_yuzdesi INTEGER NOT NULL
);

-- 4, 5, 6 ve 8. Satın Alma, Rezervasyon ve Takip [cite: 17, 21, 22, 30]
-- (Eser satışı ve etkinlik rezervasyonu tek tabloda birleştirildi)
CREATE TABLE islemler (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER REFERENCES kullanicilar(id),
    eser_id INTEGER REFERENCES eserler(id), -- Eser satın alınıyorsa dolu
    etkinlik_id INTEGER REFERENCES etkinlikler(id), -- Rezervasyon yapılıyorsa dolu
    kupon_id INTEGER REFERENCES kuponlar(id), -- İndirim kullanıldıysa [cite: 36]
    katilimci_sayisi INTEGER DEFAULT 1, -- Etkinlik rezervasyonu için [cite: 19]
    toplam_tutar DECIMAL(10,2) NOT NULL,
    odeme_yontemi VARCHAR(50), [cite: 23]
    durum VARCHAR(50) DEFAULT 'Onaylandı', -- 'İptal Edildi', 'Tamamlandı' [cite: 21]
    islem_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12, 13, 14 ve 15. Yorum, Değerlendirme, Yanıt ve Güvenilirlik [cite: 42, 46, 49, 51]
CREATE TABLE yorumlar (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER REFERENCES kullanicilar(id) NOT NULL, [cite: 52]
    eser_id INTEGER REFERENCES eserler(id), 
    etkinlik_id INTEGER REFERENCES etkinlikler(id),
    puan INTEGER CHECK (puan >= 1 AND puan <= 5), [cite: 47]
    metin TEXT NOT NULL,
    admin_yaniti TEXT, -- 14. Madde: Yöneticinin yanıtı burada tutulur [cite: 50]
    faydali_oy_sayisi INTEGER DEFAULT 0, -- 13. Madde: Filtreleme için [cite: 47]
    dogrulanmis_satin_alma BOOLEAN DEFAULT FALSE, -- 15. Madde: Güvenilirlik için [cite: 52]
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Müşteri Destek [cite: 38]
CREATE TABLE destek_talepleri (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER REFERENCES kullanicilar(id),
    konu VARCHAR(150) NOT NULL,
    mesaj TEXT NOT NULL, [cite: 39]
    durum VARCHAR(50) DEFAULT 'Açık', -- 'Yanıtlandı', 'Kapalı'
    admin_yaniti TEXT
);

-- 11. Eser ve Etkinlik Karşılaştırma [cite: 40, 41]
-- (Kullanıcının karşılaştırma sonuçlarını kaydetmesi için minimalist yaklaşım)
CREATE TABLE karsilastirmalar (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
    tip VARCHAR(20) NOT NULL, -- 'eser' veya 'etkinlik'
    oge_idler JSONB NOT NULL -- Karşılaştırılan ID'leri (Örn: [1, 5, 8]) JSON olarak tutar 
);


Tablo Tasarımı Notları:

İstatistik ve Raporlama (16. Madde): Bu madde için ekstra bir tabloya gerek yoktur. Doluluk oranı, ortalama puan ve beğeni sayıları mevcut islemler ve yorumlar tabloları üzerinden SQL sorguları (COUNT, AVG, SUM) ile dinamik olarak hesaplanabilir.


Karşılaştırmalar Tablosu (11. Madde): Karmaşık ilişki tabloları kurmak yerine, karşılaştırılan ürünlerin ID'lerini PostgreSQL'in JSONB veri tipinde tutmak tablo sayısını ciddi oranda azaltır ve tam istenen "kaydetme" işlevini sağlar


