const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/verifications', adminController.getVerifications);
router.post('/approve', adminController.approveHandyman);
router.get('/gigs', adminController.getAllGigsAdmin); // Used for admin dashboard
router.get('/users', adminController.getAllUsers);
router.post('/users/action', adminController.userAction);

module.exports = router;
