const pool = require('../db');

exports.getEserler = async (req, res) => {
    try {
        const query = `
      SELECT e.*, s.ad AS sanatci_adi,
      EXISTS (
        SELECT 1 FROM kuponlar k 
        WHERE k.sanatci_id = e.sanatci_id AND k.hedef_turu IN ('tum', 'eser')
      ) as has_kupon
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
