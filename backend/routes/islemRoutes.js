const express = require('express');
const router = express.Router();
const islemController = require('../controllers/islemController');

router.post('/', islemController.createIslem);
router.get('/kullanici/:userId', islemController.getUserIslemler);

module.exports = router;
