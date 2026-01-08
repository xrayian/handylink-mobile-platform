const express = require('express');
const router = express.Router();
const gigController = require('../controllers/gig.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.get('/', gigController.getAllGigs);
router.get('/:id', gigController.getGigById);
router.get('/:id/reviews', gigController.getGigReviews);

router.post('/', authenticate, authorize('handyman'), gigController.createGig);
router.put('/:id', authenticate, authorize('handyman'), gigController.updateGig);
router.delete('/:id', authenticate, authorize(['handyman', 'admin']), gigController.deleteGig);

module.exports = router;
