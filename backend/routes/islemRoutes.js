const express = require('express');
const router = express.Router();
const islemController = require('../controllers/islemController');

router.post('/', islemController.createIslem);
router.get('/kullanici/:userId', islemController.getUserIslemler);
router.put('/:id/iptal', islemController.cancelIslem);
router.put('/:id/guncelle', islemController.updateIslem);
router.get('/kupon/:kod', islemController.validateKupon);
router.get('/satici/:saticiId', islemController.getIslemlerBySatici);
router.put('/:id/durum', islemController.updateIslemDurum);
router.put('/:id/degistir', islemController.changeEtkinlikSession);

module.exports = router;
