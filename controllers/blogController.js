const Blog = require('../models/Blog');
const { formatDate } = require('../utils/jalali');
const { get500, get404 } = require('./errorController');
const { truncate } = require('../utils/helpers');

exports.getIndex = async (req, res) => {
	try {
		const posts = await Blog.find({ status: 'public' }).sort({
			createdAt: 'desc',
		});
		res.render('index', {
			pageTitle: 'وبلاگ',
			path: '/',
			posts,
			formatDate,
			truncate,
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
