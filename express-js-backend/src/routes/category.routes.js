const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/', categoryController.getCategories);
router.post('/', authenticate, categoryController.createCategory); // Assuming any auth user can create

module.exports = router;
