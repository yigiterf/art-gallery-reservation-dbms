const express = require('express');
const router = express.Router();
const favoriController = require('../controllers/favoriController');

// GET /api/favoriler/kullanici/:userId        → Favori eser listesi (detaylı)
router.get('/kullanici/:userId', favoriController.getFavoriler);

// GET /api/favoriler/kullanici/:userId/idler  → Sadece favori ID'leri (hızlı kontrol)
router.get('/kullanici/:userId/idler', favoriController.getFavoriIdler);

// POST /api/favoriler                         → Favoriye ekle
router.post('/', favoriController.addFavori);

// DELETE /api/favoriler/:userId/:eserIdParam  → Favoriden çıkar
router.delete('/:userId/:eserIdParam', favoriController.removeFavori);

module.exports = router;
