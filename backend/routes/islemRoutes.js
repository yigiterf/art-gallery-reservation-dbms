const express = require('express');
const router = express.Router();
const islemController = require('../controllers/islemController');

router.post('/', islemController.createIslem);
router.get('/kullanici/:userId', islemController.getUserIslemler);
router.put('/:id/iptal', islemController.cancelIslem);
router.put('/:id/guncelle', islemController.updateIslem);
router.get('/kupon/:kod', islemController.validateKupon);

module.exports = router;
