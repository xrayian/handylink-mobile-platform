const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.post('/', authenticate, bookingController.createBooking);
// Note: Handyman bookings are at /api/handyman/bookings, handled in handyman.controller.js

router.patch('/:id', authenticate, authorize('handyman'), bookingController.updateBookingStatus); // Handyman updates status

module.exports = router;
