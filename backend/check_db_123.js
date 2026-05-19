const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'artgallery',
  password: '123',
  port: 5432,
});

(async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Success:', result.rows[0]);
  } catch (err) {
    console.error('DB Error:', err.message);
  } finally {
    pool.end();
  }
})();
