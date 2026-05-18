const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/karsilastirmaController');

router.get('/kullanici/:kullanici_id', ctrl.getKarsilastirmalar);
router.post('/', ctrl.saveKarsilastirma);
router.delete('/:id', ctrl.deleteKarsilastirma);

module.exports = router;
