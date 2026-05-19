const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'artgallery',
  password: 'admin7',
  port: 5432,
});

(async () => {
  try {
    const baslik = 'Test Event';
    const tarih = '2026-05-20T20:00';
    const ucret = '150';
    const kontenjan = '50';
    const sanatci_id = 1;

    const result = await pool.query(
      'INSERT INTO etkinlikler (baslik, tarih_saat, ucret, kontenjan, sanatci_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [baslik, tarih, ucret, kontenjan, sanatci_id]
    );
    console.log('Success:', result.rows[0]);
  } catch (err) {
    console.error('DB Insert Error:', err.message);
  } finally {
    pool.end();
  }
})();
