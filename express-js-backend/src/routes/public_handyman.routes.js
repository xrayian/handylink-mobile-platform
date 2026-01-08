const express = require('express');
const router = express.Router();
const handymanController = require('../controllers/handyman.controller');

router.get('/:id', handymanController.getPublicProfile);
router.get('/:id/gigs', handymanController.getPublicGigs);
router.get('/:id/reviews', handymanController.getPublicReviews);

module.exports = router;
