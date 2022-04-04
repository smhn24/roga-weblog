const Yup = require('yup');
const captchapng = require('captchapng');

const Blog = require('../models/Blog');
const { formatDate } = require('../utils/jalali');
const { get500, get404 } = require('./errorController');
const { truncate } = require('../utils/helpers');
const { sendEmail } = require('../utils/mailer');

let CAPTCHA_NUM;

exports.getIndex = async (req, res) => {
	const page = +req.query.page || 1;
	const postPerPage = +req.query.limit || 2;

	try {
		const numberOfPosts = await Blog.find({
			status: 'public',
		}).countDocuments();
		const posts = await Blog.find({ status: 'public' })
			.sort({
				createdAt: 'desc',
			})
			.skip((page - 1) * postPerPage)
			.limit(postPerPage);
		res.render('index', {
			pageTitle: 'وبلاگ',
			path: '/',
			posts,
			formatDate,
			truncate,
			currentPage: page,
			nextPage: page + 1,
			previousPage: page - 1,
			hasNextPage: postPerPage * page < numberOfPosts,
			hasPreviousPage: page > 1,
			lastPage: Math.ceil(numberOfPosts / postPerPage),
		});
	} catch (err) {
		console.log(err);
		get500(req, res);
	}
};

exports.getSinglePost = async (req, res) => {
	try {
		const post = await Blog.findById(req.params.id).populate('user');
		if (!post) return get404(req, res);

		res.render('post', {
			pageTitle: post.title,
			path: '/post',
			post,
			formatDate,
		});
	} catch (err) {
		console.log(err);
		get500(req, res);
	}
};

exports.getContactPage = (req, res) => {
	res.render('contact', {
		pageTitle: 'تماس با ما',
		path: '/contact',
		message: req.flash('success_msg'),
		error: req.flash('error'),
		errors: [],
	});
};

exports.handleContactPage = async (req, res) => {
	const errors = [];
	const { fullname, email, message } = req.body;

	const schema = Yup.object().shape({
		fullname: Yup.string().required(
			'وارد کردن نام و نام خانوادگی الزامی است',
		),
		email: Yup.string()
			.email('ایمیل معتبر نیست')
			.required('وارد کردن ایمیل الزامی است'),
		message: Yup.string().required('وارد کردن پیام الزامی است'),
	});

	try {
		await schema.validate(req.body, { abortEarly: false });

		if (parseInt(req.body.captcha) === CAPTCHA_NUM) {
			sendEmail(
				email,
				fullname,
				'پیام از طرف وبلاگ',
				`پیام کاربر: ${message} <br><br> ایمیل کاربر: ${email}`,
			);

			req.flash('success_msg', 'پیام شما با موفقیت ارسال شد');
			return res.redirect('/contact-us');
		}

		req.flash('error', 'کد امنیتی اشتباه است');
		res.redirect('/contact-us');
	} catch (err) {
		err.inner.forEach((e) => {
			errors.push({ name: e.path, message: e.message });
		});
		return res.render('contact', {
			pageTitle: 'تماس با ما',
			path: '/contact',
			message: req.flash('success_msg'),
			error: req.flash('error'),
			errors,
		});
	}
};

exports.getCaptcha = (req, res) => {
	CAPTCHA_NUM = parseInt(Math.random() * 9999 + 1000);

	const p = new captchapng(80, 30, CAPTCHA_NUM);
	p.color(0, 0, 0, 0);
	p.color(80, 80, 80, 255);

	const img = p.getBase64();
	const imgbase64 = Buffer(img, 'base64');

	res.send(imgbase64);
};
