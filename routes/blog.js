const { Router } = require('express');

const blogController = require('../controllers/blogController');

const router = new Router();

//* @desc Weblog index page
//* @route GET /
router.get('/', blogController.getIndex);

module.exports = router;
