const { Router } = require('express');
const { authenticated } = require('../middlewares/auth');

const adminController = require('../controllers/adminController');

const router = new Router();

// @desc Dashboard
// @route GET /dashboard/
router.get('/', authenticated, adminController.getDashboard);

// @desc Add Post
// @route GET /dashboard/add-post
router.get('/add-post', authenticated, adminController.getAddPosts);

module.exports = router;
