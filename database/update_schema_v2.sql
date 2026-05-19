-- Kuponlara yaş/cinsiyet kısıtlaması ekleme
ALTER TABLE kuponlar ADD COLUMN IF NOT EXISTS min_yas INTEGER;
ALTER TABLE kuponlar ADD COLUMN IF NOT EXISTS max_yas INTEGER;
ALTER TABLE kuponlar ADD COLUMN IF NOT EXISTS cinsiyet_kisitlamasi VARCHAR(20);
ALTER TABLE kuponlar ADD COLUMN IF NOT EXISTS sanatci_id INTEGER REFERENCES sanatcilar(id) ON DELETE CASCADE;
ALTER TABLE kuponlar ADD COLUMN IF NOT EXISTS hedef_turu VARCHAR(20) DEFAULT 'tum'; -- 'eser', 'etkinlik', 'tum'
ALTER TABLE kuponlar ADD COLUMN IF NOT EXISTS aciklama TEXT;

-- Yorumlara sahip yanıtı alanı (zaten admin_yaniti var, onu kullanıyoruz)
-- yorum_sahibi_id: Bu alanı yorumun ait olduğu eser/etkinlik sahibinin yanıtı için kullanacağız
ALTER TABLE yorumlar ADD COLUMN IF NOT EXISTS sahip_yaniti TEXT;
ALTER TABLE yorumlar ADD COLUMN IF NOT EXISTS sahip_yaniti_tarihi TIMESTAMP;
