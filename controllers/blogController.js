const Blog = require('../models/Blog');
const { formatDate } = require('../utils/jalali');
const { get500, get404 } = require('./errorController');
const { truncate } = require('../utils/helpers');

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
