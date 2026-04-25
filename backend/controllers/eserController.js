const pool = require('../db');

exports.getEserler = async (req, res) => {
    try {
        const query = `
      SELECT e.*, s.ad AS sanatci_adi 
      FROM eserler e 
      JOIN sanatcilar s ON e.sanatci_id = s.id
      ORDER BY e.id ASC
    `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Eserler alınamadı' });
    }
};
