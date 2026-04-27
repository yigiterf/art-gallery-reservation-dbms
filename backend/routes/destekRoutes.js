const express = require('express');
const router = express.Router();
const destekController = require('../controllers/destekController');

router.post('/', destekController.createDestek);
router.get('/', destekController.getBenimDesteklerim);

module.exports = router;
