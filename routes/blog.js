const { Router } = require('express');

const blogController = require('../controllers/blogController');
const { authenticated } = require('../middlewares/auth');

const router = Router();

/**
 * @route GET /
 * @description Home page
 */
router.get('/', blogController.index);

/**
 * @route GET /articles/:slug
 * @description Single Post Page
 */
router.get('/post/:slug', blogController.singlePost);

/**
 * @route GET /contact-us
 * @description Contact US Page
 */
router.get('/contact-us', blogController.contactUs);

/**
 * @route GET /delete-comment/:commentId
 * @description Delete Comment
 */
router.get('/delete-comment/:commentId', blogController.deleteComment);

/**
 * @route POST /comment/:id
 * @description Handle Comment
 */
router.post('/comment/:blogId', blogController.handleComment);

/**
 * @route POST /contact-us
 * @description Handle Contact US Page
 */
router.post('/contact-us', blogController.handleContactUs);

/**
 * @route POST /search
 * @description Handle Search
 */
router.post('/search', blogController.handleSearch);

module.exports = router;
