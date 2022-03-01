const { Router } = require('express');
const Yup = require('yup');

const router = new Router();

const schema = Yup.object().shape({
	fullname: Yup.string()
		.required('نام و نام خانوادگی وارد نشده است')
		.min(4)
		.max(255),
	email: Yup.string()
		.email('ایمیل معتبر نیست')
		.required('ایمیل وارد نشده است'),
	password: Yup.string().required('کلمه عبور وارد نشده است').min(4).max(255),
	confirmPassword: Yup.string()
		.required('تکرار کلمه عبور وارد نشده است')
		.oneOf([Yup.ref('password'), null]),
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
			res.send('All is good.');
		})
		.catch((err) => {
			console.log(err);
			res.send('error', { errors: err.errors });
		});
});

module.exports = router;
