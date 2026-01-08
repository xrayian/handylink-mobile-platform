const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/', authenticate, userController.getProfile);
router.post('/update', authenticate, userController.updateProfile);

module.exports = router;
