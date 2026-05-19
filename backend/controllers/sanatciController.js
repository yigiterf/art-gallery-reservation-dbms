const pool = require('../db');

exports.getSanatciProfil = async (req, res) => {
    const { id } = req.params;
    try {
        // Sanatçı bilgilerini al
        const sanatciRes = await pool.query('SELECT * FROM sanatcilar WHERE id = $1', [id]);
        if (sanatciRes.rows.length === 0) {
            return res.status(404).json({ message: 'Sanatçı bulunamadı.' });
        }
        const sanatci = sanatciRes.rows[0];

        // Sanatçının eserlerini al
        const eserlerRes = await pool.query('SELECT * FROM eserler WHERE sanatci_id = $1 ORDER BY id DESC', [id]);
        
        // Sanatçının etkinliklerini al
        const etkinliklerRes = await pool.query('SELECT * FROM etkinlikler WHERE sanatci_id = $1 ORDER BY tarih_saat DESC', [id]);

        res.json({
            ...sanatci,
            eserler: eserlerRes.rows,
            etkinlikler: etkinliklerRes.rows
        });
    } catch (error) {
        console.error('Sanatçı profili getirme hatası:', error);
        res.status(500).json({ message: 'Sanatçı profili alınamadı.' });
    }
};
