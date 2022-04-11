const { Router } = require('express');

const userController = require('../controllers/userController');
const { authenticated } = require('../middlewares/auth');

const router = Router();

/**
 * @route GET /users/login
 * @description Login page
 */
router.get('/login', userController.login);

/**
 * @route GET /users/logout
 * @description Logout Handle
 */
router.get('/logout', authenticated, userController.logout);

/**
 * @route GET /users/register
 * @description Register page
 */
router.get('/register', userController.register);

/**
 * @route GET /users/forget-password
 * @description Forget password page
 */
router.get('/forget-password', userController.forgetPassword);

/**
 * @route GET /users/reset-password:token
 * @description Reset password page
 */
router.get('/reset-password/:token', userController.resetPassword);

/**
 * @route POST /users/login
 * @description Login Handle
 */
router.post('/login', userController.handleLogin, userController.rememberMe);

/**
 * @route POST /users/register
 * @description Register Handle
 */
router.post('/register', userController.createUser);

/**
 * @route POST /users/forget-password
 * @description Forget password Handle
 */
router.post('/forget-password', userController.handleForgetPassword);

/**
 * @route POST /users/reset-password:id
 * @description Reset password Handle
 */
router.post('/reset-password/:id', userController.handleResetPassword);

module.exports = router;
