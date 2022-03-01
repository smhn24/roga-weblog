const { Router } = require('express');

const User = require('../models/user');

const router = new Router();

//* @desc Login page
//* @route GET /users/login
router.get('/login', (req, res) => {
	res.render('login', { pageTitle: 'ورود به بخش مدیریت', path: '/login' });
});

//* @desc Register page
//* @route GET /users/register
router.get('/register', (req, res) => {
	res.render('register', {
		pageTitle: 'ثبت نام کاربر جدید',
		path: '/register',
	});
});

//* @desc Register handle
//* @route POST /users/register
router.post('/register', async (req, res) => {
	try {
		await User.userValidation(req.body);
		res.redirect('/users/login');
	} catch (err) {
		console.log(err);
		const errors = [];
		err.inner.forEach((e) => {
			errors.push({ name: e.path, message: e.message });
		});
		return res.render('register', {
			pageTitle: 'ثبت نام کاربر جدید',
			path: '/register',
			errors,
		});
	}
});

module.exports = router;
