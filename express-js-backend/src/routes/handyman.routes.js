const express = require('express');
const router = express.Router();
const handymanController = require('../controllers/handyman.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const upload = require('../utils/fileUpload');

router.use(authenticate);
router.use(authorize('handyman'));

router.get('/profile', handymanController.getMyProfile);
router.post('/verify', upload.single('document'), handymanController.verifyProfile);
router.get('/stats', handymanController.getStats);
router.get('/bookings', handymanController.getMyBookings);
router.get('/gigs', handymanController.getMyGigs);

module.exports = router;
