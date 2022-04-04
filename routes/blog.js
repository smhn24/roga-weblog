const { Router } = require('express');

const blogController = require('../controllers/blogController');

const router = new Router();

// @desc Weblog index page
// @route GET /
router.get('/', blogController.getIndex);

// @desc Weblog post page
// @route GET /post/:id
router.get('/post/:id', blogController.getSinglePost);

// @desc Weblog Contact-us page
// @route GET /contact-us
router.get('/contact-us', blogController.getContactPage);

// @desc Weblog Numeric Captcha
// @route GET /captcha.png
router.get('/captcha.png', blogController.getCaptcha);

// @desc Weblog Handle Contact-us
// @route POST /contact-us
router.post('/contact-us', blogController.handleContactPage);

module.exports = router;
