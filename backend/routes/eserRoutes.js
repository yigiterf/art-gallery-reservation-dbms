const express = require('express');
const router = express.Router();
const eserController = require('../controllers/eserController');

router.get('/', eserController.getEserler);

module.exports = router;
