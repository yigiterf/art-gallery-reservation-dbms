const pool = require('./db');

(async () => {
  try {
    const res = await pool.query("SELECT * FROM kullanicilar WHERE ad_soyad = 'ali şengezen'");
    console.log("Kullanici:", res.rows[0]);

    if (res.rows[0]) {
      const artRes = await pool.query("SELECT * FROM sanatcilar WHERE kullanici_id = $1", [res.rows[0].id]);
      console.log("Sanatci:", artRes.rows);
    }
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    pool.end();
  }
})();
