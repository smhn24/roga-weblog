const { Router } = require('express');

const userController = require('../controllers/userController');

const router = new Router();

// @desc Login page
// @route GET /users/login
router.get('/login', userController.login);

// @desc Login handle
// @route POST /users/login
router.post('/login', userController.handleLogin);

// @desc Register page
// @route GET /users/register
router.get('/register', userController.register);

// @desc Register handle
// @route POST /users/register
router.post('/register', userController.createUser);

module.exports = router;
