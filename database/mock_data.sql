-- Tüm verileri temizle
TRUNCATE TABLE destek_talepleri, karsilastirmalar, yorumlar, favoriler, islemler, kuponlar, etkinlikler, eserler, sanatcilar, kullanicilar RESTART IDENTITY CASCADE;

-- ══════════════════════════════════════════
-- 1. KULLANICILAR (admin + 2 satıcı + 8 müşteri)
-- ══════════════════════════════════════════
INSERT INTO kullanicilar (ad_soyad, email, sifre_hash, rol, yas, cinsiyet) VALUES
('Yönetici Admin',    'admin@artgallery.com',       '$2a$10$zMma834cj31BNFXZosWUYu5l42Wp5EIS/LPArR5NuanpBt53LtJMC', 'admin',     35, 'Erkek'),
('Elif Arslan',       'elif.arslan@example.com',     '$2a$10$zMma834cj31BNFXZosWUYu5l42Wp5EIS/LPArR5NuanpBt53LtJMC', 'satici',    29, 'Kadin'),
('Burak Özdemir',     'burak.ozdemir@example.com',   '$2a$10$zMma834cj31BNFXZosWUYu5l42Wp5EIS/LPArR5NuanpBt53LtJMC', 'satici',    42, 'Erkek'),
('Zeynep Koç',        'zeynep.koc@example.com',      '$2a$10$zMma834cj31BNFXZosWUYu5l42Wp5EIS/LPArR5NuanpBt53LtJMC', 'kullanici', 24, 'Kadin'),
('Ali Yılmaz',        'ali.yilmaz@example.com',      '$2a$10$zMma834cj31BNFXZosWUYu5l42Wp5EIS/LPArR5NuanpBt53LtJMC', 'kullanici', 31, 'Erkek'),
('Selin Aydın',       'selin.aydin@example.com',     '$2a$10$zMma834cj31BNFXZosWUYu5l42Wp5EIS/LPArR5NuanpBt53LtJMC', 'kullanici', 22, 'Kadin'),
('Emre Karagöz',      'emre.karagoz@example.com',    '$2a$10$zMma834cj31BNFXZosWUYu5l42Wp5EIS/LPArR5NuanpBt53LtJMC', 'kullanici', 38, 'Erkek'),
('Deniz Çetin',       'deniz.cetin@example.com',     '$2a$10$zMma834cj31BNFXZosWUYu5l42Wp5EIS/LPArR5NuanpBt53LtJMC', 'kullanici', 27, 'Kadin'),
('Murat Şahin',       'murat.sahin@example.com',     '$2a$10$zMma834cj31BNFXZosWUYu5l42Wp5EIS/LPArR5NuanpBt53LtJMC', 'kullanici', 45, 'Erkek'),
('Ayşe Demirtaş',     'ayse.demirtas@example.com',   '$2a$10$zMma834cj31BNFXZosWUYu5l42Wp5EIS/LPArR5NuanpBt53LtJMC', 'kullanici', 19, 'Kadin'),
('Cem Tuncer',        'cem.tuncer@example.com',      '$2a$10$zMma834cj31BNFXZosWUYu5l42Wp5EIS/LPArR5NuanpBt53LtJMC', 'kullanici', 33, 'Erkek');

-- ══════════════════════════════════════════
-- 2. SANATÇILAR (satıcı kullanıcılara bağlı)
-- ══════════════════════════════════════════
INSERT INTO sanatcilar (ad, biyografi, kullanici_id) VALUES
('Elif Arslan',   'İstanbul doğumlu çağdaş ressam. Soyut ekspresyonizm ve dijital sanat alanında çalışmalar üretmektedir. Eserleri Pera Müzesi ve İstanbul Modern''de sergilenmiştir.', (SELECT id FROM kullanicilar WHERE email='elif.arslan@example.com')),
('Burak Özdemir', 'Ankara merkezli heykeltraş ve seramik sanatçısı. Doğa ile insan ilişkisini sorguladığı üç boyutlu eserleriyle tanınır. Uluslararası bienallere katılmıştır.', (SELECT id FROM kullanicilar WHERE email='burak.ozdemir@example.com'));

-- ══════════════════════════════════════════
-- 3. ESERLER (her sanatçıdan 4-5 eser)
-- ══════════════════════════════════════════
INSERT INTO eserler (sanatci_id, baslik, aciklama, fiyat, gorsel_url, stok) VALUES
-- Elif Arslan eserleri
((SELECT id FROM sanatcilar WHERE ad='Elif Arslan'), 'Metropol Işıkları',        'İstanbul gece silüetinin neon renklerle soyut yorumu. Akrilik boya, 120x80 cm tuval.',                  8500.00,  'https://picsum.photos/800/600?random=11', 3),
((SELECT id FROM sanatcilar WHERE ad='Elif Arslan'), 'Sessiz Fırtına',           'Marmara Denizi''nin kasvetli bir günde yakalanmış hali. Yağlı boya, 100x70 cm.',                     12000.00, 'https://picsum.photos/800/600?random=12', 1),
((SELECT id FROM sanatcilar WHERE ad='Elif Arslan'), 'Kapadokya Rüyası',         'Peri bacalarının gün batımında dijital kolaj tekniğiyle yeniden yorumu.',                              6500.00,  'https://picsum.photos/800/600?random=13', 5),
((SELECT id FROM sanatcilar WHERE ad='Elif Arslan'), 'Kırmızı Oda',              'Minimalist iç mekan kompozisyonu. Sınırlı renk paletinde derinlik araştırması.',                     15000.00, 'https://picsum.photos/800/600?random=14', 1),
((SELECT id FROM sanatcilar WHERE ad='Elif Arslan'), 'Dijital Yansımalar',       'NFT koleksiyonundan fiziksel baskı. Giclée baskı, sınırlı üretim 10 adet.',                          4200.00,  'https://picsum.photos/800/600?random=15', 8),
-- Burak Özdemir eserleri
((SELECT id FROM sanatcilar WHERE ad='Burak Özdemir'), 'Toprak ve Zaman',        'Seramik heykel. Anadolu topraklarından elde edilen doğal malzemelerle üretilmiştir. 45 cm.',         22000.00, 'https://picsum.photos/800/600?random=16', 1),
((SELECT id FROM sanatcilar WHERE ad='Burak Özdemir'), 'Uçuş Serisi #3',         'Bronz döküm kuş figürü. Özgürlük temalı heykel serisi. 60 cm.',                                     35000.00, 'https://picsum.photos/800/600?random=17', 1),
((SELECT id FROM sanatcilar WHERE ad='Burak Özdemir'), 'Kırılgan Denge',          'Cam ve metal karışım tekniğiyle üretilmiş enstalasyon parçası.',                                     18500.00, 'https://picsum.photos/800/600?random=18', 2),
((SELECT id FROM sanatcilar WHERE ad='Burak Özdemir'), 'Anadolu Mask',            'Geleneksel Anadolu maskelerinden esinlenmiş duvar seramiği. 35x35 cm.',                              7800.00,  'https://picsum.photos/800/600?random=19', 4);

-- ══════════════════════════════════════════
-- 4. ETKİNLİKLER (sanatçılara bağlı)
-- ══════════════════════════════════════════
INSERT INTO etkinlikler (baslik, tarih_saat, ucret, kontenjan, sanatci_id) VALUES
('Soyut Ekspresyonizm Atölyesi',   '2026-06-10 14:00:00', 350.00, 15, (SELECT id FROM sanatcilar WHERE ad='Elif Arslan')),
('Dijital Sanat ve NFT Semineri',   '2026-06-20 10:00:00', 200.00, 40, (SELECT id FROM sanatcilar WHERE ad='Elif Arslan')),
('Sulu Boya Başlangıç Kursu',      '2026-07-05 13:00:00', 275.00, 20, (SELECT id FROM sanatcilar WHERE ad='Elif Arslan')),
('Seramik Atölyesi: Toprakla Buluşma', '2026-06-15 11:00:00', 450.00, 12, (SELECT id FROM sanatcilar WHERE ad='Burak Özdemir')),
('Heykel Çalıştayı: Form ve Boşluk',  '2026-07-12 14:00:00', 600.00, 8,  (SELECT id FROM sanatcilar WHERE ad='Burak Özdemir')),
('Modern Sanat Tarihi Yürüyüşü',      '2026-08-01 09:00:00', 150.00, 30, (SELECT id FROM sanatcilar WHERE ad='Burak Özdemir'));

-- ══════════════════════════════════════════
-- 5. KUPONLAR
-- ══════════════════════════════════════════
INSERT INTO kuponlar (kod, indirim_yuzdesi, sanatci_id, hedef_turu, aciklama, min_yas, max_yas, cinsiyet_kisitlamasi) VALUES
('YAZ25',      25, (SELECT id FROM sanatcilar WHERE ad='Elif Arslan'),   'tum',      'Yaz kampanyası tüm ürünlerde', NULL, NULL, NULL),
('GENC15',     15, (SELECT id FROM sanatcilar WHERE ad='Elif Arslan'),   'eser',     'Genç sanat severler için',     16,   25,   NULL),
('KADIN10',    10, (SELECT id FROM sanatcilar WHERE ad='Burak Özdemir'), 'etkinlik', 'Kadınlara özel etkinlik indirimi', NULL, NULL, 'Kadin'),
('SERAMIK20',  20, (SELECT id FROM sanatcilar WHERE ad='Burak Özdemir'), 'tum',      'Seramik tutkunlarına özel',     NULL, NULL, NULL);

-- ══════════════════════════════════════════
-- 6. İŞLEMLER (satın almalar & rezervasyonlar)
-- ══════════════════════════════════════════
-- Eser satışları
INSERT INTO islemler (kullanici_id, eser_id, toplam_tutar, odeme_yontemi, durum, islem_tarihi) VALUES
((SELECT id FROM kullanicilar WHERE email='ali.yilmaz@example.com'),    (SELECT id FROM eserler WHERE baslik='Metropol Işıkları'),   8500.00,  'Kredi Kartı',   'Onaylandı', NOW() - INTERVAL '12 days'),
((SELECT id FROM kullanicilar WHERE email='zeynep.koc@example.com'),    (SELECT id FROM eserler WHERE baslik='Sessiz Fırtına'),     12000.00,  'Banka Havalesi', 'Onaylandı', NOW() - INTERVAL '8 days'),
((SELECT id FROM kullanicilar WHERE email='emre.karagoz@example.com'),  (SELECT id FROM eserler WHERE baslik='Toprak ve Zaman'),    22000.00,  'Kredi Kartı',   'Onaylandı', NOW() - INTERVAL '5 days'),
((SELECT id FROM kullanicilar WHERE email='murat.sahin@example.com'),   (SELECT id FROM eserler WHERE baslik='Uçuş Serisi #3'),    35000.00,  'Banka Havalesi', 'Bekliyor',  NOW() - INTERVAL '2 days'),
((SELECT id FROM kullanicilar WHERE email='deniz.cetin@example.com'),   (SELECT id FROM eserler WHERE baslik='Dijital Yansımalar'), 4200.00,   'Kredi Kartı',   'Onaylandı', NOW() - INTERVAL '15 days'),
((SELECT id FROM kullanicilar WHERE email='selin.aydin@example.com'),   (SELECT id FROM eserler WHERE baslik='Kapadokya Rüyası'),  6500.00,   'Kredi Kartı',   'Onaylandı', NOW() - INTERVAL '3 days'),
((SELECT id FROM kullanicilar WHERE email='cem.tuncer@example.com'),    (SELECT id FROM eserler WHERE baslik='Kırılgan Denge'),     18500.00,  'Banka Havalesi', 'Onaylandı', NOW() - INTERVAL '20 days'),
((SELECT id FROM kullanicilar WHERE email='ayse.demirtas@example.com'), (SELECT id FROM eserler WHERE baslik='Anadolu Mask'),       7800.00,   'Kredi Kartı',   'Bekliyor',  NOW() - INTERVAL '1 day');

-- Etkinlik rezervasyonları
INSERT INTO islemler (kullanici_id, etkinlik_id, katilimci_sayisi, toplam_tutar, odeme_yontemi, durum, islem_tarihi) VALUES
((SELECT id FROM kullanicilar WHERE email='zeynep.koc@example.com'),    (SELECT id FROM etkinlikler WHERE baslik='Soyut Ekspresyonizm Atölyesi'),      2, 700.00,  'Kredi Kartı',   'Onaylandı', NOW() - INTERVAL '10 days'),
((SELECT id FROM kullanicilar WHERE email='selin.aydin@example.com'),   (SELECT id FROM etkinlikler WHERE baslik='Dijital Sanat ve NFT Semineri'),     1, 200.00,  'Kredi Kartı',   'Onaylandı', NOW() - INTERVAL '7 days'),
((SELECT id FROM kullanicilar WHERE email='ali.yilmaz@example.com'),    (SELECT id FROM etkinlikler WHERE baslik='Seramik Atölyesi: Toprakla Buluşma'), 1, 450.00,  'Banka Havalesi', 'Onaylandı', NOW() - INTERVAL '6 days'),
((SELECT id FROM kullanicilar WHERE email='deniz.cetin@example.com'),   (SELECT id FROM etkinlikler WHERE baslik='Heykel Çalıştayı: Form ve Boşluk'),  1, 600.00,  'Kredi Kartı',   'Bekliyor',  NOW() - INTERVAL '4 days'),
((SELECT id FROM kullanicilar WHERE email='emre.karagoz@example.com'),  (SELECT id FROM etkinlikler WHERE baslik='Sulu Boya Başlangıç Kursu'),         3, 825.00,  'Kredi Kartı',   'Onaylandı', NOW() - INTERVAL '9 days'),
((SELECT id FROM kullanicilar WHERE email='murat.sahin@example.com'),   (SELECT id FROM etkinlikler WHERE baslik='Modern Sanat Tarihi Yürüyüşü'),     2, 300.00,  'Banka Havalesi', 'Onaylandı', NOW() - INTERVAL '11 days'),
((SELECT id FROM kullanicilar WHERE email='ayse.demirtas@example.com'), (SELECT id FROM etkinlikler WHERE baslik='Soyut Ekspresyonizm Atölyesi'),      1, 350.00,  'Kredi Kartı',   'Onaylandı', NOW() - INTERVAL '10 days'),
((SELECT id FROM kullanicilar WHERE email='cem.tuncer@example.com'),    (SELECT id FROM etkinlikler WHERE baslik='Dijital Sanat ve NFT Semineri'),     1, 200.00,  'Kredi Kartı',   'Onaylandı', NOW() - INTERVAL '7 days');

-- İptal edilmiş işlem
INSERT INTO islemler (kullanici_id, eser_id, toplam_tutar, odeme_yontemi, durum, islem_tarihi) VALUES
((SELECT id FROM kullanicilar WHERE email='cem.tuncer@example.com'), (SELECT id FROM eserler WHERE baslik='Kırmızı Oda'), 15000.00, 'Kredi Kartı', 'İptal Edildi', NOW() - INTERVAL '18 days');

-- ══════════════════════════════════════════
-- 7. FAVORİLER
-- ══════════════════════════════════════════
INSERT INTO favoriler (kullanici_id, eser_id) VALUES
((SELECT id FROM kullanicilar WHERE email='zeynep.koc@example.com'),    (SELECT id FROM eserler WHERE baslik='Kırmızı Oda')),
((SELECT id FROM kullanicilar WHERE email='zeynep.koc@example.com'),    (SELECT id FROM eserler WHERE baslik='Dijital Yansımalar')),
((SELECT id FROM kullanicilar WHERE email='ali.yilmaz@example.com'),    (SELECT id FROM eserler WHERE baslik='Uçuş Serisi #3')),
((SELECT id FROM kullanicilar WHERE email='ali.yilmaz@example.com'),    (SELECT id FROM eserler WHERE baslik='Sessiz Fırtına')),
((SELECT id FROM kullanicilar WHERE email='selin.aydin@example.com'),   (SELECT id FROM eserler WHERE baslik='Metropol Işıkları')),
((SELECT id FROM kullanicilar WHERE email='selin.aydin@example.com'),   (SELECT id FROM eserler WHERE baslik='Kırmızı Oda')),
((SELECT id FROM kullanicilar WHERE email='deniz.cetin@example.com'),   (SELECT id FROM eserler WHERE baslik='Toprak ve Zaman')),
((SELECT id FROM kullanicilar WHERE email='emre.karagoz@example.com'),  (SELECT id FROM eserler WHERE baslik='Kapadokya Rüyası')),
((SELECT id FROM kullanicilar WHERE email='murat.sahin@example.com'),   (SELECT id FROM eserler WHERE baslik='Anadolu Mask')),
((SELECT id FROM kullanicilar WHERE email='ayse.demirtas@example.com'), (SELECT id FROM eserler WHERE baslik='Sessiz Fırtına')),
((SELECT id FROM kullanicilar WHERE email='cem.tuncer@example.com'),    (SELECT id FROM eserler WHERE baslik='Metropol Işıkları'));

-- ══════════════════════════════════════════
-- 8. YORUMLAR (doğrulanmış satın alma ile)
-- ══════════════════════════════════════════
INSERT INTO yorumlar (kullanici_id, eser_id, puan, metin, dogrulanmis_satin_alma) VALUES
((SELECT id FROM kullanicilar WHERE email='ali.yilmaz@example.com'),    (SELECT id FROM eserler WHERE baslik='Metropol Işıkları'),   5, 'Gerçekten büyüleyici bir eser. Salonumuzun odak noktası oldu, renk geçişleri inanılmaz.', TRUE),
((SELECT id FROM kullanicilar WHERE email='zeynep.koc@example.com'),    (SELECT id FROM eserler WHERE baslik='Sessiz Fırtına'),      4, 'Çok etkileyici bir atmosfer yakalamış. Tek eksiğim çerçevenin ayrı satılması.', TRUE),
((SELECT id FROM kullanicilar WHERE email='emre.karagoz@example.com'),  (SELECT id FROM eserler WHERE baslik='Toprak ve Zaman'),     5, 'Heykel koleksiyonumun en değerli parçası. Burak Bey''in işçiliği mükemmel.', TRUE),
((SELECT id FROM kullanicilar WHERE email='deniz.cetin@example.com'),   (SELECT id FROM eserler WHERE baslik='Dijital Yansımalar'),  4, 'Modern ve şık. Ofisime çok yakıştı. Baskı kalitesi de gayet iyi.', TRUE),
((SELECT id FROM kullanicilar WHERE email='selin.aydin@example.com'),   (SELECT id FROM eserler WHERE baslik='Kapadokya Rüyası'),   5, 'Kapadokya aşığı biri olarak bu eseri görünce hemen aldım. Harika!', TRUE),
((SELECT id FROM kullanicilar WHERE email='cem.tuncer@example.com'),    (SELECT id FROM eserler WHERE baslik='Kırılgan Denge'),      3, 'Güzel bir eser ama kargo sürecinde küçük bir çizik oluşmuş. Sanat olarak etkileyici.', TRUE);

INSERT INTO yorumlar (kullanici_id, etkinlik_id, puan, metin, dogrulanmis_satin_alma) VALUES
((SELECT id FROM kullanicilar WHERE email='zeynep.koc@example.com'),    (SELECT id FROM etkinlikler WHERE baslik='Soyut Ekspresyonizm Atölyesi'),      5, 'Elif Hanım çok ilham verici bir eğitimci. Kesinlikle tekrar katılacağım!', TRUE),
((SELECT id FROM kullanicilar WHERE email='selin.aydin@example.com'),   (SELECT id FROM etkinlikler WHERE baslik='Dijital Sanat ve NFT Semineri'),     4, 'NFT dünyasına giriş için mükemmel bir seminer. Çok şey öğrendim.', TRUE),
((SELECT id FROM kullanicilar WHERE email='ali.yilmaz@example.com'),    (SELECT id FROM etkinlikler WHERE baslik='Seramik Atölyesi: Toprakla Buluşma'), 5, 'Toprakla çalışmak terapötik bir deneyimdi. Burak Bey harika bir rehber.', TRUE),
((SELECT id FROM kullanicilar WHERE email='emre.karagoz@example.com'),  (SELECT id FROM etkinlikler WHERE baslik='Sulu Boya Başlangıç Kursu'),         4, 'Başlangıç seviyesi için ideal. Malzemeler kaliteliydi, mekan güzeldi.', TRUE),
((SELECT id FROM kullanicilar WHERE email='murat.sahin@example.com'),   (SELECT id FROM etkinlikler WHERE baslik='Modern Sanat Tarihi Yürüyüşü'),     5, 'İstanbul''un sanat tarihine farklı bir pencereden bakmamı sağladı. Çok öğretici.', TRUE),
((SELECT id FROM kullanicilar WHERE email='ayse.demirtas@example.com'), (SELECT id FROM etkinlikler WHERE baslik='Soyut Ekspresyonizm Atölyesi'),      4, 'İlk atölye deneyimimdi, çok keyif aldım. Biraz kalabalıktı ama genel olarak süper.', TRUE);

-- ══════════════════════════════════════════
-- 9. DESTEK TALEPLERİ (bazıları işleme bağlı)
-- ══════════════════════════════════════════
INSERT INTO destek_talepleri (kullanici_id, konu, mesaj, durum, admin_yaniti, islem_id) VALUES
((SELECT id FROM kullanicilar WHERE email='cem.tuncer@example.com'),
 'Sipariş Sorunu', 'Kırılgan Denge eserinde kargoda oluşan çizik var, iade veya değişim talep ediyorum.',
 'İşlemde', 'Merhaba, konuyu satıcıya ilettik. En kısa sürede size dönüş yapılacaktır.',
 (SELECT id FROM islemler WHERE kullanici_id = (SELECT id FROM kullanicilar WHERE email='cem.tuncer@example.com') AND eser_id = (SELECT id FROM eserler WHERE baslik='Kırılgan Denge'))
),
((SELECT id FROM kullanicilar WHERE email='deniz.cetin@example.com'),
 'Rezervasyon Sorunu', 'Heykel Çalıştayı için ödeme yaptım ama henüz onay gelmedi, ne zaman onaylanır?',
 'Açık', NULL,
 (SELECT id FROM islemler WHERE kullanici_id = (SELECT id FROM kullanicilar WHERE email='deniz.cetin@example.com') AND etkinlik_id IS NOT NULL LIMIT 1)
),
((SELECT id FROM kullanicilar WHERE email='murat.sahin@example.com'),
 'Ödeme Sorunu', 'Uçuş Serisi #3 için havale yaptım ama durum hâlâ Bekliyor görünüyor.',
 'Açık', NULL,
 (SELECT id FROM islemler WHERE kullanici_id = (SELECT id FROM kullanicilar WHERE email='murat.sahin@example.com') AND eser_id IS NOT NULL AND durum='Bekliyor' LIMIT 1)
);

-- ══════════════════════════════════════════
-- 10. KARŞILAŞTIRMALAR
-- ══════════════════════════════════════════
INSERT INTO karsilastirmalar (kullanici_id, tip, oge_idler) VALUES
((SELECT id FROM kullanicilar WHERE email='zeynep.koc@example.com'), 'eser',
 (SELECT json_agg(id)::jsonb FROM eserler WHERE baslik IN ('Metropol Işıkları', 'Sessiz Fırtına', 'Kırmızı Oda'))
),
((SELECT id FROM kullanicilar WHERE email='ali.yilmaz@example.com'), 'etkinlik',
 (SELECT json_agg(id)::jsonb FROM etkinlikler WHERE baslik IN ('Soyut Ekspresyonizm Atölyesi', 'Seramik Atölyesi: Toprakla Buluşma'))
);
