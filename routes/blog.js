const { Router } = require('express');

const blogController = require('../controllers/blogController');

const router = Router();

/**
 * @route GET /
 * @description Home page
 */
router.get('/', blogController.index);

/**
 * @route GET /blog/:id
 * @description Single Post Page
 */
router.get('/post/:id', blogController.singlePost);

/**
 * @route GET /contact-us
 * @description Contact US Page
 */
router.get('/contact-us', blogController.contactUs);

/**
 * @route GET /captcha.png
 * @description Numeric Captcha
 */
router.get('/captcha.png', blogController.captcha);

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
