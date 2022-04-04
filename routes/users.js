const { Router } = require('express');

const userController = require('../controllers/userController');
const { authenticated } = require('../middlewares/auth');

const router = new Router();

// @desc Login page
// @route GET /users/login
router.get('/login', userController.login);

// @desc Login handle
// @route POST /users/login
router.post('/login', userController.handleLogin, userController.rememberMe);

// @desc Logout handle
// @route GET /users/logout
router.get('/logout', authenticated, userController.logout);

// @desc Register page
// @route GET /users/register
router.get('/register', userController.register);

// @desc Forget Password page
// @route GET /users/forget-password
router.get('/forget-password', userController.forgetPassword);

// @desc Register handle
// @route POST /users/register
router.post('/register', userController.createUser);

// @desc Handle Forget Password
// @route POST /users/forget-password
router.post('/forget-password', userController.handleForgetPassword);

module.exports = router;
