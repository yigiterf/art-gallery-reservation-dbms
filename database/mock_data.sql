-- Önce mevcut test verilerini temizleyelim (hata oluşmaması için)
TRUNCATE TABLE kullanicilar, sanatcilar, eserler, etkinlikler, kuponlar, islemler, favoriler, yorumlar, destek_talepleri, karsilastirmalar RESTART IDENTITY CASCADE;

-- Test Kullanıcıları
INSERT INTO kullanicilar (ad_soyad, email, sifre_hash, rol) VALUES
('Ali Yılmaz', 'ali.yilmaz@example.com', 'hashed_password_123', 'kullanici'),
('Ayşe Kaya', 'ayse.kaya@example.com', 'hashed_password_123', 'kullanici'),
('Mehmet Demir', 'mehmet.demir@example.com', 'hashed_password_123', 'kullanici'),
('Fatma Çelik', 'fatma.celik@example.com', 'hashed_password_123', 'kullanici'),
('Canan Şahin', 'canan.sahin@example.com', 'hashed_password_123', 'kullanici');

-- Sanatçılar
INSERT INTO sanatcilar (ad, biyografi) VALUES
('Devrim Erbil', 'Ressam ve öğretim üyesi. İstanbul soyutlamalarıyla bilinir.'),
('Bedri Rahmi Eyüboğlu', 'Türk ressam, yazar ve şair. Anadolu motiflerini modern sanata taşımıştır.'),
('Nuri İyem', 'Toplumsal gerçekçi akımın önemli temsilcilerinden.'),
('Fikret Muallâ', 'Paris ekolü Türk ressam. Renkli ve hareketli kompozisyonlarıyla tanınır.'),
('Abidin Dino', 'Çok yönlü Türk ressam, yazar, sinemacı.');

-- Eserler (İlanlar)
INSERT INTO eserler (sanatci_id, baslik, aciklama, fiyat, gorsel_url) VALUES
((SELECT id FROM sanatcilar WHERE ad='Devrim Erbil'), 'İstanbul''da Mavi', 'İstanbul siluetinin mavi tonlarda soyut yorumu, yağlı boya.', 50000.00, 'https://picsum.photos/800/600?random=1'),
((SELECT id FROM sanatcilar WHERE ad='Devrim Erbil'), 'Boğaziçi', 'Boğaziçi Köprüsü ve çevresinin geometrik kompozisyonu.', 45000.00, 'https://picsum.photos/800/600?random=2'),
((SELECT id FROM sanatcilar WHERE ad='Bedri Rahmi Eyüboğlu'), 'Karabaş', 'Anadolu motifleriyle bezenmiş portre çalışması.', 35000.00, 'https://picsum.photos/800/600?random=3'),
((SELECT id FROM sanatcilar WHERE ad='Nuri İyem'), 'Köylü Kadınlar', 'Anadolu''nun çilekeş kadınlarının hüzünlü bakışları, tuval üzeri yağlı boya.', 42000.00, 'https://picsum.photos/800/600?random=4'),
((SELECT id FROM sanatcilar WHERE ad='Fikret Muallâ'), 'Paris Sokakları', 'Paris''in renkli ve canlı gece hayatını yansıtan eser.', 60000.00, 'https://picsum.photos/800/600?random=5'),
((SELECT id FROM sanatcilar WHERE ad='Abidin Dino'), 'Uzun Yürüyüş', 'Soyut figürlerle uzun yürüyüş temalı çalışma.', 40000.00, 'https://picsum.photos/800/600?random=6');

-- Etkinlikler ve Atölyeler
INSERT INTO etkinlikler (baslik, tarih_saat, ucret, kontenjan) VALUES
('Sulu Boya Atölyesi', '2026-06-01 14:00:00', 250.00, 20),
('Modern Sanat Tarihi Semineri', '2026-06-15 10:00:00', 150.00, 50),
('Heykel Çalıştayı', '2026-07-05 13:00:00', 500.00, 10);

-- Kuponlar
INSERT INTO kuponlar (kod, indirim_yuzdesi) VALUES
('YAZ10', 10),
('SANAT20', 20);

-- İşlemler (Satın Alma ve Rezervasyonlar)
-- Ali Yılmaz, İstanbul'da Mavi'yi satın aldı
INSERT INTO islemler (kullanici_id, eser_id, toplam_tutar, odeme_yontemi, durum) VALUES
((SELECT id FROM kullanicilar WHERE email='ali.yilmaz@example.com'), (SELECT id FROM eserler WHERE baslik='İstanbul''da Mavi'), 50000.00, 'Kredi Kartı', 'Onaylandı');

-- Ayşe Kaya, Sulu Boya Atölyesi'ne rezervasyon yaptı (2 kişi)
INSERT INTO islemler (kullanici_id, etkinlik_id, katilimci_sayisi, toplam_tutar, odeme_yontemi, durum) VALUES
((SELECT id FROM kullanicilar WHERE email='ayse.kaya@example.com'), (SELECT id FROM etkinlikler WHERE baslik='Sulu Boya Atölyesi'), 2, 500.00, 'Banka Havalesi', 'Onaylandı');

-- Mehmet Demir, Paris Sokakları'nı satın aldı
INSERT INTO islemler (kullanici_id, eser_id, toplam_tutar, odeme_yontemi, durum) VALUES
((SELECT id FROM kullanicilar WHERE email='mehmet.demir@example.com'), (SELECT id FROM eserler WHERE baslik='Paris Sokakları'), 60000.00, 'Kredi Kartı', 'Kargoda');

-- Fatma Çelik, Heykel Çalıştayı'na rezervasyon yaptı
INSERT INTO islemler (kullanici_id, etkinlik_id, katilimci_sayisi, toplam_tutar, odeme_yontemi, durum) VALUES
((SELECT id FROM kullanicilar WHERE email='fatma.celik@example.com'), (SELECT id FROM etkinlikler WHERE baslik='Heykel Çalıştayı'), 1, 500.00, 'Kredi Kartı', 'Onaylandı');

-- Canan Şahin, Köylü Kadınlar eserini favoriye ekledi
INSERT INTO favoriler (kullanici_id, eser_id) VALUES
((SELECT id FROM kullanicilar WHERE email='canan.sahin@example.com'), (SELECT id FROM eserler WHERE baslik='Köylü Kadınlar'));

-- Ali Yılmaz, Boğaziçi eserini favoriye ekledi
INSERT INTO favoriler (kullanici_id, eser_id) VALUES
((SELECT id FROM kullanicilar WHERE email='ali.yilmaz@example.com'), (SELECT id FROM eserler WHERE baslik='Boğaziçi'));

-- Yorumlar
INSERT INTO yorumlar (kullanici_id, eser_id, puan, metin, dogrulanmis_satin_alma) VALUES
((SELECT id FROM kullanicilar WHERE email='ali.yilmaz@example.com'), (SELECT id FROM eserler WHERE baslik='İstanbul''da Mavi'), 5, 'Harika bir eser, duvarıma çok yakıştı. Kargo da çok hızlıydı.', TRUE);

INSERT INTO yorumlar (kullanici_id, etkinlik_id, puan, metin, dogrulanmis_satin_alma) VALUES
((SELECT id FROM kullanicilar WHERE email='ayse.kaya@example.com'), (SELECT id FROM etkinlikler WHERE baslik='Sulu Boya Atölyesi'), 4, 'Çok keyifli bir atölyeydi, eğitmen çok ilgiliydi ama biraz kalabalıktı.', TRUE);

-- Destek Talepleri
INSERT INTO destek_talepleri (kullanici_id, konu, mesaj) VALUES
((SELECT id FROM kullanicilar WHERE email='mehmet.demir@example.com'), 'Kargo Takibi', 'Siparişim ne zaman kargoya verilecek?');
