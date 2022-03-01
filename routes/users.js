const { Router } = require('express');
const Validator = require('fastest-validator');

const router = new Router();
const v = new Validator();

const schema = {
	fullname: {
		type: 'string',
		trim: true,
		min: 4,
		max: 255,
		messages: {
			required: 'نام و نام کاربری الزامی است',
			stringMax: 'نام و نام خانوادگی طولانی است',
			stringMin: 'نام و نام خانوادگی نباید کمتر از 4 کاراکتر باشد',
			stringMax: 'نام و نام خانوادگی طولانی است',
		},
	},
	email: {
		type: 'email',
		normalize: true,
		messages: {
			required: 'آدرس ایمیل الزامی است',
			emailEmpty: 'ایمیل نباید خالی باشد',
		},
	},
	password: {
		type: 'string',
		min: 4,
		max: 255,
		messages: {
			required: 'کلمه عبور الزامی است',
			stringMin: 'کلمه عبور نباید کمتر از 4 کاراکتر باشد',
			stringMax: 'کلمه عبور طولانی است',
		},
	},
	confirmPasswrod: {
		type: 'string',
		min: 4,
		max: 255,
		messages: {
			required: 'تکرار کلمه عبور الزامی است',
			stringMin: 'تکرار کلمه عبور نباید کمتر از 4 کاراکتر باشد',
			stringMax: 'تکرار کلمه عبور طولانی است',
		},
	},
};

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
router.post('/register', (req, res) => {
	const validate = v.validate(req.body, schema);
	const errArr = [];
	if (validate == 'true') {
		const { fullname, email, password, confirmPasswrod } = req.body;
		if (password !== confirmPasswrod) {
			errArr.push({ message: 'کلمه های عبور یکسان نیستند' });
			return res.render('register', {
				pageTitle: 'ثبت نام کاربر جدید',
				path: '/register',
				errors: errArr,
			});
		}
		res.redirect('/users/login');
	} else {
		console.log(validate);
		res.render('register', {
			pageTitle: 'ثبت نام کاربر جدید',
			path: '/register',
			errors: validate,
		});
	}
});

module.exports = router;
