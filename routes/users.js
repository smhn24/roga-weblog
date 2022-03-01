const { Router } = require('express');
const Yup = require('yup');

const router = new Router();

const schema = Yup.object().shape({
	fullname: Yup.string()
		.required('نام و نام خانوادگی الزامی است')
		.min(4, 'نام و نام خانوادگی نباید کمتر از 4 کاراکتر باشد')
		.max(255, 'نام و نام خانوادگی طولانی است'),
	email: Yup.string().email('ایمیل معتبر نیست').required('ایمیل الزامی است'),
	password: Yup.string()
		.required('کلمه عبور وارد نشده است')
		.min(4, 'کلمه عبور نباید کمتر از 4 کاراکتر باشد')
		.max(255, 'کلمه عبور طولانی است'),
	confirmPassword: Yup.string()
		.required('تکرار کلمه عبور الزامی است')
		.oneOf(
			[Yup.ref('password'), null],
			'کلمه عبور و تکرار کلمه عبور یکسان نیستند',
		),
});

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
	schema
		.validate(req.body)
		.then((result) => {
			console.log(result);
			res.redirect('/users/login');
		})
		.catch((err) => {
			console.log(err.errors);
			res.render('register', {
				pageTitle: 'ثبت نام کاربر جدید',
				path: '/register',
				errors: err.errors,
			});
		});
});

module.exports = router;
