const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/my-bookings', authenticate, bookingController.getMyBookings);

module.exports = router;
