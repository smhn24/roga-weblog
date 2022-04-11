const { unlink } = require('fs/promises');

const sharp = require('sharp');
const { nanoid } = require('nanoid');
const appRoot = require('app-root-path');

const Blog = require('../models/Blog');
const { formatDate } = require('../utils/jalali');
const { get500 } = require('./errorController');
const { fileExist } = require('../utils/fileExsiting');
const { imageValidation } = require('../models/secure/imageValidation');

exports.dashboard = async (req, res) => {
	const page = +req.query.page || 1;
	const postPerPage = +req.query.limit || 5;

	try {
		const numberOfPosts = await Blog.find({
			user: req.user.id,
		}).countDocuments();
		const blogs = await Blog.find({ user: req.user.id })
			.sort({ createdAt: 'desc' })
			.skip((page - 1) * postPerPage)
			.limit(postPerPage);
		res.setHeader(
			'Cache-Control',
			'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0',
		);
		res.render('admin/blogs', {
			pageTitle: 'بخش مدیریت | داشبورد',
			path: '/dashboard',
			layout: './layouts/dashboardLayout',
			fullname: req.user.fullname,
			blogs,
			formatDate,
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

exports.getAddPosts = (req, res) => {
	res.render('admin/addPost', {
		pageTitle: 'بخش مدیریت | ساخت پست جدید',
		path: '/dashboard/add-post',
		layout: './layouts/dashboardLayout',
		fullname: req.user.fullname,
	});
};

exports.imageGallery = (req, res) => {
	res.render('admin/imageGallery', {
		pageTitle: 'بخش مدیریت | گالری تصاویر',
		path: '/dashboard/image-gallery',
		fullname: req.user.fullname,
	});
};

exports.getEditPost = async (req, res) => {
	const post = await Blog.findById(req.params.id);
	if (!post) return res.redirect('errors/404');
	if (post.user.toString() !== req.user.id) return res.redirect('/dashboard');
	res.render('admin/editPost', {
		pageTitle: 'بخش مدیریت | ویرایش پست',
		path: '/dashboard/edit-post',
		fullname: req.user.fullname,
		post,
	});
};

exports.editPost = async (req, res) => {
	const errors = [];
	const post = await Blog.findById(req.params.id);
	const thumbnail = req.files ? req.files.thumbnail : {};
	const fileName = `${nanoid()}_${thumbnail.name}`;
	const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;

	try {
		if (thumbnail.name)
			await Blog.postValidation({ ...req.body, thumbnail });
		else
			await Blog.postValidation({
				...req.body,
				thumbnail: {
					name: 'placeholder',
					size: 0,
					mimetype: 'image/jpeg',
				},
			});

		if (!post) return res.redirect('/errors/404');
		if (post.user.toString() !== req.user.id)
			return res.redirect('/dashboard');

		if (thumbnail.name) {
			const thumbPath = `${appRoot}/public/uploads/thumbnails/${post.thumbnail}`;
			if (await fileExist(thumbPath)) await unlink(thumbPath);

			if (thumbnail.mimetype === 'image/jpeg') {
				await sharp(thumbnail.data)
					.jpeg({
						quality: 60,
					})
					.toFile(uploadPath)
					.catch((err) => console.log(err));
			} else if (thumbnail.mimetype === 'image/png') {
				await sharp(thumbnail.data)
					.png({
						quality: 60,
					})
					.toFile(uploadPath)
					.catch((err) => console.log(err));
			}
		}

		const { title, status, body } = req.body;
		post.title = title;
		post.status = status;
		post.body = body;
		post.thumbnail = thumbnail.name ? fileName : post.thumbnail;
		await post.save();
		res.redirect('/dashboard');
	} catch (err) {
		err.inner.forEach((e) => {
			errors.push({ name: e.path, message: e.message });
		});
		return res.render('admin/editPost', {
			pageTitle: 'بخش مدیریت | ویرایش پست',
			path: '/dashboard/edit-post',
			layout: './layouts/dashboardLayout',
			fullname: req.user.fullname,
			errors,
			post,
		});
	}
};

exports.createPost = async (req, res) => {
	const errors = [];

	const thumbnail = req.files ? req.files.thumbnail : {};
	const fileName = `${nanoid()}_${thumbnail.name}`;
	const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;

	try {
		req.body = { ...req.body, thumbnail };

		await Blog.postValidation(req.body);
		if (thumbnail.mimetype === 'image/jpeg') {
			await sharp(thumbnail.data)
				.jpeg({
					quality: 60,
				})
				.toFile(uploadPath)
				.catch((err) => console.log(err));
		} else if (thumbnail.mimetype === 'image/png') {
			await sharp(thumbnail.data)
				.png({
					quality: 60,
				})
				.toFile(uploadPath)
				.catch((err) => console.log(err));
		}
		await Blog.create({
			...req.body,
			user: req.user.id,
			thumbnail: fileName,
		});
		res.redirect('/dashboard');
	} catch (err) {
		err.inner.forEach((e) => {
			errors.push({ name: e.path, message: e.message });
		});
		return res.render('admin/addPost', {
			pageTitle: 'بخش مدیریت | ساخت پست جدید',
			path: '/dashboard/add-post',
			layout: './layouts/dashboardLayout',
			fullname: req.user.fullname,
			errors,
		});
	}
};

exports.deletePost = async (req, res) => {
	const post = await Blog.findById(req.params.id);
	if (!post) return res.redirect('errors/404');
	if (post.user.toString() != req.user.id) return res.redirect('/dashboard');
	post.remove();
	return res.redirect('/dashboard');
};

exports.uploadImage = async (req, res) => {
	const errors = [];

	const image = req.files ? req.files.image : {};
	const fileName = `${nanoid()}_${image.name}`;
	const uploadPath = `${appRoot}/public/uploads/images/${fileName}`;

	try {
		await imageValidation.validate(image, { abortEarly: false });
		if (image.mimetype === 'image/jpeg') {
			await sharp(image.data)
				.jpeg({ quality: 60 })
				.toFile(uploadPath)
				.catch((err) => console.log(err));
			res.status(200).send(
				`http://localhost:3000/uploads/images/${fileName}`,
			);
		} else if (image.mimetype === 'image/png') {
			await sharp(image.data)
				.png({ quality: 60 })
				.toFile(uploadPath)
				.catch((err) => console.log(err));
			res.status(200).send(
				`http://localhost:3000/uploads/images/${fileName}`,
			);
		}
	} catch (err) {
		console.log(err);
		err.inner.forEach((e) => {
			errors.push({ name: e.path, message: e.message });
		});
		res.status(400).send(errors);
	}
};

exports.handleDashboardSearch = async (req, res) => {
	const page = +req.query.page || 1;
	const postPerPage = +req.query.limit || 5;

	try {
		const numberOfPosts = await Blog.find({
			user: req.user.id,
			$text: { $search: req.body.search },
		}).countDocuments();
		const blogs = await Blog.find({
			user: req.user.id,
			$text: { $search: req.body.search },
		})
			.sort({ createdAt: 'desc' })
			.skip((page - 1) * postPerPage)
			.limit(postPerPage);
		res.render('admin/blogs', {
			pageTitle: 'بخش مدیریت | داشبورد',
			path: '/dashboard',
			layout: './layouts/dashboardLayout',
			fullname: req.user.fullname,
			blogs,
			formatDate,
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
