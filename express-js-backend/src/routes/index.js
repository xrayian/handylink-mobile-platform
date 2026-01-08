const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const handymanRoutes = require('./handyman.routes');
const publicHandymanRoutes = require('./public_handyman.routes');
const gigRoutes = require('./gig.routes');
const bookingRoutes = require('./booking.routes');
const customerRoutes = require('./customer.routes');
const reviewRoutes = require('./review.routes');
const categoryRoutes = require('./category.routes');
const adminRoutes = require('./admin.routes');

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/handyman', handymanRoutes);
router.use('/handymen', publicHandymanRoutes);
router.use('/gigs', gigRoutes);
router.use('/bookings', bookingRoutes);
router.use('/', customerRoutes); // Mounts /my-bookings to /api/my-bookings
router.use('/reviews', reviewRoutes);
router.use('/categories', categoryRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
