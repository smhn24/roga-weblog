const passport = require('passport');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { sendEmail } = require('../utils/mailer');
const { get404 } = require('./errorController');

exports.login = (req, res) => {
	res.setHeader(
		'Cache-Control',
		'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0',
	);
	res.render('auth/login', {
		pageTitle: 'ورود به بخش مدیریت',
		path: '/login',
		message: req.flash('success_msg'),
		error: req.flash('error'),
	});
};

exports.handleLogin = async (req, res, next) => {
	if (!req.body['g-recaptcha-response']) {
		req.flash('error', 'احراز هویت captcha را انجام دهید');
		return res.redirect('/users/login');
	}

	const secretKey = process.env.CAPTCHA_SECRET;
	const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body['g-recaptcha-response']}&remoteip=${req.connection.remoteAddress}`;

	try {
		const response = await fetch(verifyUrl, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				contentType: 'application/x-www-form-urlencoded; charset=utf-8',
			},
		});
		const json = await response.json();
		if (json.success) {
			passport.authenticate('local', {
				failureRedirect: '/users/login',
				failureFlash: true,
			})(req, res, next);
		} else {
			req.flash('error', 'مشکلی در captcah وجود دارد');
			return res.redirect('/users/login');
		}
	} catch (err) {
		console.log(err);
		req.flash('error', 'مشکلی به وجود آمده است');
		return res.redirect('/users/login');
	}
};

exports.rememberMe = (req, res) => {
	if (req.body.remember) {
		req.session.cookie.originalMaxAge = 24 * 60 * 60 * 1000;
	} else {
		req.session.cookie.expire = null;
	}

	res.redirect('/dashboard');
};

exports.logout = (req, res) => {
	req.session = null;
	req.logout();
	res.setHeader(
		'Cache-Control',
		'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0',
	);
	res.redirect('/users/login');
};

exports.register = (req, res) => {
	res.render('auth/register', {
		pageTitle: 'ثبت نام کاربر جدید',
		path: '/register',
	});
};

exports.createUser = async (req, res) => {
	const errors = [];

	if (!req.body['g-recaptcha-response']) {
		errors.push({ message: 'احراز هویت captcha را انجام دهید' });
		return res.render('auth/register', {
			pageTitle: 'ثبت نام کاربر جدید',
			path: '/register',
			errors,
		});
	}
	const secretKey = process.env.CAPTCHA_SECRET;
	const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body['g-recaptcha-response']}&remoteip=${req.connection.remoteAddress}`;

	try {
		const response = await fetch(verifyUrl, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				contentType: 'application/x-www-form-urlencoded; charset=utf-8',
			},
		});
		const json = await response.json();
		if (!json.success) {
			errors.push({ message: 'مشکلی در captcah وجود دارد' });
			return res.render('auth/register', {
				pageTitle: 'ثبت نام کاربر جدید',
				path: '/register',
				errors,
			});
		}
	} catch (err) {
		errors.push({ message: 'مشکلی به جود آمده است' });
		return res.render('auth/register', {
			pageTitle: 'ثبت نام کاربر جدید',
			path: '/register',
			errors,
		});
	}

	try {
		await User.userValidation(req.body);
		const { fullname, password, email } = req.body;
		const user = await User.findOne({ email });
		if (user) {
			errors.push({ message: 'کاربری با این ایمیل وجود دارد' });
			return res.render('auth/register', {
				pageTitle: 'ثبت نام کاربر جدید',
				path: '/register',
				errors,
			});
		}

		await User.create({ fullname, email, password });

		//? Send welcome email
		sendEmail(
			email,
			fullname,
			'به سایت وبلاگ خوش آمدید',
			'خیلی خوشحالیم که به جمع ما پیوستید. امیدوارم وبلاگ های زیبایی توسط شما منتشر بشه.',
		);

		req.flash('success_msg', 'ثبت نام با موفقیت انجام شد');
		res.redirect('/users/login');
	} catch (err) {
		console.log(err);
		err.inner.forEach((e) => {
			errors.push({ name: e.path, message: e.message });
		});
		return res.render('auth/register', {
			pageTitle: 'ثبت نام کاربر جدید',
			path: '/register',
			errors,
		});
	}
};

exports.forgetPassword = async (req, res) => {
	res.render('auth/forgetPassword', {
		pageTitle: 'فراموشی رمز عبور',
		path: '/login',
		message: req.flash('success_msg'),
		error: req.flash('error'),
	});
};

exports.handleForgetPassword = async (req, res) => {
	const { email } = req.body;

	const user = await User.findOne({ email });
	if (!user) {
		req.flash('error', 'کاربری با این ایمیل وجود ندارد');
		return res.redirect('/users/forget-password');
	}

	const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
		expiresIn: '1h',
	});
	const resetLink = `http://weblog.nabavi.dev/users/reset-password/${token}`;
	sendEmail(
		user.email,
		user.fullname,
		'فراموشی رمز عبور',
		`<h1>برای تغییر رمز عبور روی لینک زیر کلیک کنید</h1> <a href="${resetLink}">لینک تغییر رمز عبور</a>`,
	);
	req.flash('success_msg', 'لینک تغییر رمز عبور به ایمیل شما ارسال شد');
	res.redirect('/users/login');
};

exports.resetPassword = async (req, res) => {
	const token = req.params.token;

	let decodedToken;
	try {
		decodedToken = jwt.verify(token, process.env.JWT_SECRET);
	} catch (err) {
		console.log(err);
		if (!decodedToken) {
			return get404(req, res);
		}
	}

	res.render('auth/resetPassword', {
		pageTitle: 'تغییر رمز عبور',
		path: '/login',
		message: req.flash('success_msg'),
		error: req.flash('error'),
		userId: decodedToken.userId,
	});
};

exports.handleResetPassword = async (req, res) => {
	const { password, confirmPassword } = req.body;

	if (password !== confirmPassword) {
		req.flash('error', 'رمز عبور و تکرار آن یکسان نیست');
		return res.render('auth/resetPassword', {
			pageTitle: 'تغییر رمز عبور',
			path: '/login',
			message: req.flash('success_msg'),
			error: req.flash('error'),
			userId: req.params.id,
		});
	}

	const user = await User.findById(req.params.id);
	if (!user) {
		return get404(req, res);
	}

	user.password = password;
	await user.save();

	req.flash('success_msg', 'رمز عبور با موفقیت به روز رسانی شد');
	res.redirect('/users/login');
};
