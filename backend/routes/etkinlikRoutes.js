const express = require('express');
const router = express.Router();
const etkinlikController = require('../controllers/etkinlikController');

router.post('/', etkinlikController.createEtkinlik);
router.get('/', etkinlikController.getAllEtkinlikler);
router.get('/istatistik', etkinlikController.getIstatistik);
router.get('/satici/:sanatci_id', etkinlikController.getEtkinliklerim);
router.put('/:id/kontenjan', etkinlikController.updateKontenjan);

module.exports = router;
