const Blog = require('../models/Blog');
const { formatDate } = require('../utils/jalali');
const { get500 } = require('./errorController');
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
