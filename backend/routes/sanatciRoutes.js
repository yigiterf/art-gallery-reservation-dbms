const express = require('express');
const router = express.Router();
const sanatciController = require('../controllers/sanatciController');

router.get('/:id/profil', sanatciController.getSanatciProfil);
router.put('/:id', sanatciController.updateSanatci);

module.exports = router;
