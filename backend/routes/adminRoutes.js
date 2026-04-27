const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin yetki kontrolü (mock veya jwt eklenebilir, şimdilik geçiyoruz veya basit bir stub ekleyebiliriz)
const isAdmin = (req, res, next) => {
    // Şimdilik herkes panele girebilsin (development için). Gerçekte JWT kontrolü olmalı.
    next();
};

router.use(isAdmin);

// Dashboard
router.get('/stats', adminController.getStats);

// Users
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);

// Artists
router.get('/artists', adminController.getArtists);
router.post('/artists', adminController.addArtist);
router.delete('/artists/:id', adminController.deleteArtist);

// Artworks
router.get('/artworks', adminController.getArtworks);
router.post('/artworks', adminController.addArtwork);
router.delete('/artworks/:id', adminController.deleteArtwork);

// Events
router.get('/events', adminController.getEvents);
router.post('/events', adminController.addEvent);
router.delete('/events/:id', adminController.deleteEvent);

// Coupons
router.get('/coupons', adminController.getCoupons);
router.post('/coupons', adminController.addCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

// Transactions
router.get('/transactions', adminController.getTransactions);
router.put('/transactions/:id/status', adminController.updateTransactionStatus);

// Reviews
router.get('/reviews', adminController.getReviews);
router.put('/reviews/:id/reply', adminController.updateReviewAdminReply);
router.delete('/reviews/:id', adminController.deleteReview);

// Support
router.get('/support', adminController.getSupportTickets);
router.put('/support/:id', adminController.updateSupportTicket);

module.exports = router;
