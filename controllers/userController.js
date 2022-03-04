const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../models/User');

exports.login = (req, res) => {
	res.render('login', {
		pageTitle: 'ورود به بخش مدیریت',
		path: '/login',
		message: req.flash('success_msg'),
		error: req.flash('error'),
	});
};

exports.handleLogin = (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/dashboard',
		failureRedirect: '/users/login',
		failureFlash: true,
	})(req, res, next);
};

exports.logout = (req, res) => {
	req.logout();
	req.flash('success_msg', 'خروج موفقیت آمیز بود');
	res.redirect('/users/login');
};

exports.register = (req, res) => {
	res.render('register', {
		pageTitle: 'ثبت نام کاربر جدید',
		path: '/register',
	});
};

exports.createUser = async (req, res) => {
	const errors = [];
	try {
		await User.userValidation(req.body);
		const { fullname, password, email } = req.body;
		const user = await User.findOne({ email });
		if (user) {
			errors.push({ message: 'کاربری با این ایمیل وجود دارد' });
			return res.render('register', {
				pageTitle: 'ثبت نام کاربر جدید',
				path: '/register',
				errors,
			});
		}

		const hash = await bcrypt.hash(password, 10);
		await User.create({
			fullname,
			email,
			password: hash,
		});
		req.flash('success_msg', 'ثبت نام با موفقیت انجام شد');
		res.redirect('/users/login');
	} catch (err) {
		console.log(err);
		err.inner.forEach((e) => {
			errors.push({ name: e.path, message: e.message });
		});
		return res.render('register', {
			pageTitle: 'ثبت نام کاربر جدید',
			path: '/register',
			errors,
		});
	}
};
