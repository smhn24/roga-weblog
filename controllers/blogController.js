const Yup = require('yup');
const fetch = require('node-fetch');

const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Category = require('../models/Category');

const { formatDate } = require('../utils/jalali');
const { get500, get404 } = require('./errorController');
const { sendEmail } = require('../utils/mailer');

exports.index = async (req, res) => {
	let page = +req.query.page || 1;
	const postPerPage = +req.query.limit || 5;

	try {
		const usersNumber = await User.find().countDocuments();
		const categoryNumbers = await Category.find().countDocuments();
		const numberOfPosts = await Blog.find({
			status: 'public',
		}).countDocuments();
		const posts = await Blog.find({ status: 'public' })
			.sort({
				createdAt: 'desc',
			})
			.skip((page - 1) * postPerPage)
			.limit(postPerPage)
			.populate(['user', 'category']);
		while (posts.length === 0 && page > 1) page--;
		res.render('index', {
			pageTitle: 'وبلاگ',
			path: '/',
			posts,
			formatDate,
			currentPage: page,
			nextPage: page + 1,
			previousPage: page - 1,
			hasNextPage: postPerPage * page < numberOfPosts,
			hasPreviousPage: page > 1,
			lastPage: Math.ceil(numberOfPosts / postPerPage),
			isAuthenticated: req.isAuthenticated(),
			postsNumber: numberOfPosts,
			usersNumber,
			categoryNumbers,
		});
	} catch (err) {
		consola.error(err);
		get500(req, res);
	}
};

exports.singlePost = async (req, res) => {
	try {
		const post = await Blog.findOne({ slug: req.params.slug }).populate([
			'user',
			'category',
		]);
		if (post.length == 0) return get404(req, res);

		const similarPosts = await Blog.find({
			_id: { $ne: post.id },
			category: post.category,
		}).populate(['user', 'category']);

		const comments = await await Comment.find({ blog: post.id })
			.sort({ commentedAt: 'desc' })
			.populate('commenter');

		res.render('blog/post', {
			pageTitle: post.title,
			path: '/post',
			post,
			similarPosts,
			formatDate,
			comments,
			user: req.user,
			isAuthenticated: req.isAuthenticated(),
		});
	} catch (err) {
		consola.error(err);
		get500(req, res);
	}
};

exports.contactUs = (req, res) => {
	res.render('common/contactUs', {
		pageTitle: 'تماس با ما',
		path: '/contact-us',
		success: req.flash('success'),
		isAuthenticated: req.isAuthenticated(),
		errors: [],
	});
};

exports.aboutUs = (req, res) => {
	res.render('common/aboutUs', {
		pageTitle: 'درباره ما',
		path: '/about-us',
		isAuthenticated: req.isAuthenticated(),
	});
};

exports.handleContactUs = async (req, res) => {
	const errors = [];

	const secretKey = process.env.CAPTCHA_SECRET;
	const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body['g-recaptcha-response']}&remoteip=${req.connection.remoteAddress}`;

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
		const response = await fetch(verifyUrl, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				contentType: 'application/x-www-form-urlencoded; charset=utf-8',
			},
		});
		const json = await response.json();
		if (!json.success) {
			errors.push({
				field: 'global',
				message: 'مشکلی در کپچا وجود دارد',
			});
			res.render('common/contactUs', {
				pageTitle: 'تماس با ما',
				path: '/contact-us',
				success: req.flash('success'),
				isAuthenticated: req.isAuthenticated(),
				errors,
			});
		}
	} catch (err) {
		errors.push({ field: 'global', message: 'مشکلی به جود آمده است' });
		res.render('common/contactUs', {
			pageTitle: 'تماس با ما',
			path: '/contact-us',
			success: req.flash('success'),
			isAuthenticated: req.isAuthenticated(),
			errors,
		});
	}

	try {
		await schema.validate(req.body, { abortEarly: false });

		sendEmail(
			email,
			fullname,
			'پیام از طرف وبلاگ',
			`پیام کاربر: ${message} <br><br> ایمیل کاربر: ${email}`,
		);

		req.flash('success', 'پیام شما با موفقیت ارسال شد');
		return res.redirect('/contact-us');
	} catch (err) {
		err.inner.forEach((e) => {
			errors.push({ field: e.path, message: e.message });
		});
		return res.render('common/contactUs', {
			pageTitle: 'تماس با ما',
			path: '/contact-us',
			success: req.flash('success'),
			isAuthenticated: req.isAuthenticated(),
			errors,
		});
	}
};

exports.handleSearch = async (req, res) => {
	const page = +req.query.page || 1;
	const postPerPage = +req.query.limit || 2;

	try {
		const numberOfPosts = await Blog.find({
			status: 'public',
			$text: { $search: req.body.search },
		}).countDocuments();
		const posts = await Blog.find({
			status: 'public',
			$text: { $search: req.body.search },
		})
			.sort({
				createdAt: 'desc',
			})
			.skip((page - 1) * postPerPage)
			.limit(postPerPage);
		res.render('index', {
			pageTitle: 'نتایج جستجو',
			path: '/articles',
			posts,
			formatDate,
			currentPage: page,
			nextPage: page + 1,
			previousPage: page - 1,
			hasNextPage: postPerPage * page < numberOfPosts,
			hasPreviousPage: page > 1,
			lastPage: Math.ceil(numberOfPosts / postPerPage),
			isAuthenticated: req.isAuthenticated(),
		});
	} catch (err) {
		consola.error(err);
		get500(req, res);
	}
};

exports.handleComment = async (req, res) => {
	try {
		await Comment.commentValidation(req.body);

		const { text } = req.body;
		await Comment.create({
			text,
			commenter: req.user.id,
			blog: req.params.blogId,
		});

		res.status(200).json({
			success: true,
			message: 'نظر شما با موفقیت ثبت شد',
		});
	} catch (err) {
		err.inner.forEach((e) => {
			errors.push({ field: e.path, message: e.message });
		});
		try {
			const post = await Blog.findById(req.params.blogId).populate(
				'user',
			);
			if (!post) return get404(req, res);

			const comments = await Comment.find({
				blog: req.params.id,
			})
				.populate('commenter')
				.sort({ commentedAt: 'desc' });

			res.render('blog/post', {
				pageTitle: post.title,
				path: '/post',
				post,
				formatDate,
				comments,
				errors,
				isAuthenticated: req.isAuthenticated(),
			});
		} catch (err) {
			get500(req, res);
		}
	}
};

exports.deleteComment = async (req, res) => {
	try {
		const comment = await Comment.findById(req.params.commentId);
		if (!comment) return get404(req, res);
		else if (
			comment.commenter.toString() === req.user.id ||
			req.user.role === 'admin'
		) {
			comment.remove();
			return res.redirect('back');
		}
		return get404(req, res);
	} catch (err) {
		consola.error(err);
		get500(req, res);
	}
};
