const express = require('express');
const router = express.Router();
const etkinlikController = require('../controllers/etkinlikController');

router.post('/', etkinlikController.createEtkinlik);
router.get('/', etkinlikController.getAllEtkinlikler);
router.get('/istatistik', etkinlikController.getIstatistik);

module.exports = router;
