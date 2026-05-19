const express = require('express');
const router = express.Router();
const yorumController = require('../controllers/yorumController');

// GET /api/yorumlar/eser/:eserId     → Eserin yorumları
router.get('/eser/:eserId', yorumController.getEserYorumlari);

// GET /api/yorumlar/etkinlik/:etkinlikId → Etkinliğin yorumları
router.get('/etkinlik/:etkinlikId', yorumController.getEtkinlikYorumlari);

// POST /api/yorumlar                 → Yorum ekle
router.post('/', yorumController.addYorum);

// PUT /api/yorumlar/:id/vote         → Faydalı bul
router.put('/:id/vote', yorumController.voteYorum);

// PUT /api/yorumlar/:id/sahip-yaniti → Sahip/organizatör yanıtı ekle
router.put('/:id/sahip-yaniti', yorumController.addSahipYaniti);

module.exports = router;
