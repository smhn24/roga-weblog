const { Router } = require('express');

const blogController = require('../controllers/blogController');

const router = new Router();

// @desc Weblog index page
// @route GET /
router.get('/', blogController.getIndex);

// @desc Weblog post page
// @route GET /post/:id
router.get('/post/:id', blogController.getSinglePost);

module.exports = router;
