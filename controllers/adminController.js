const { unlink } = require('fs/promises');

const sharp = require('sharp');
const { nanoid } = require('nanoid');
const appRoot = require('app-root-path');
const consola = require('consola');

const Blog = require('../models/Blog');
const Category = require('../models/Category');
const { formatDate } = require('../utils/jalali');
const { get500, get404 } = require('./errorController');
const { fileExist } = require('../utils/fileExsiting');
const { imageValidation } = require('../models/secure/imageValidation');
const { default: mongoose } = require('mongoose');

exports.dashboard = async (req, res) => {
	let page = +req.query.page || 1;
	const postPerPage = +req.query.limit || 5;

	try {
		const numberOfPosts =
			req.user.role === 'admin'
				? await Blog.find().countDocuments()
				: await Blog.find({ user: req.user.id }).countDocuments();
		const blogs =
			req.user.role === 'admin'
				? await Blog.find()
						.sort({ createdAt: 'desc' })
						.skip((page - 1) * postPerPage)
						.limit(postPerPage)
						.populate('category')
				: await Blog.find({ user: req.user.id })
						.sort({ createdAt: 'desc' })
						.skip((page - 1) * postPerPage)
						.limit(postPerPage)
						.populate('category');
		res.setHeader(
			'Cache-Control',
			'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0',
		);
		while (blogs.length === 0 && page > 1) page--;
		res.render('admin/blogs', {
			pageTitle: 'بخش مدیریت | داشبورد',
			path: '/dashboard',
			layout: './layouts/dashboardLayout',
			user: req.user,
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
		consola.error(err);
		get500(req, res);
	}
};

exports.getAddPosts = async (req, res) => {
	categories = await Category.find();

	res.render('admin/addPost', {
		pageTitle: 'بخش مدیریت | ساخت پست جدید',
		path: '/dashboard/add-post',
		layout: './layouts/dashboardLayout',
		user: req.user,
		categories,
	});
};

exports.getCategories = async (req, res) => {
	const categories = await Category.find();
	res.render('admin/categories', {
		pageTitle: 'بخش مدیریت | ساخت دسته بندی جدید',
		path: '/dashboard/categories',
		user: req.user,
		categories,
	});
};

exports.createCategory = async (req, res) => {
	let errors = [];
	const categories = await Category.find();

	if (!req.body.category) {
		errors.push({
			field: 'title',
			message: 'لطفا عنوان دسته بندی را وارد کنید',
		});

		return res.render('admin/categories', {
			pageTitle: 'بخش مدیریت | ساخت دسته بندی جدید',
			path: '/dashboard/categories',
			user: req.user,
			categories,
			errors,
		});
	}
	const categoryName = req.body.category;
	try {
		if ((await Category.findOne({ name: categoryName })) !== null) {
			errors.push({
				field: 'title',
				message: 'این دسته بندی قبلا ثبت شده است',
			});

			return res.render('admin/categories', {
				pageTitle: 'بخش مدیریت | ساخت دسته بندی جدید',
				path: '/dashboard/categories',
				user: req.user,
				categories,
				errors,
			});
		}
		await Category.create({ name: req.body.category });
		res.redirect('/dashboard/add-post');
	} catch (err) {
		consola.error(err);
		get500(req, res);
	}
};

exports.deleteCategory = async (req, res) => {
	try {
		const category = await Category.findOne({ name: req.params.category });
		if (!category) return get404(req, res);
		category.remove();
		return res.redirect('back');
	} catch (err) {
		consola.error(err);
		return get500(req, res);
	}
};

exports.imageGallery = (req, res) => {
	res.render('admin/imageGallery', {
		pageTitle: 'بخش مدیریت | گالری تصاویر',
		path: '/dashboard/image-gallery',
		user: req.user,
	});
};

exports.getEditPost = async (req, res) => {
	const post = await Blog.findById(req.params.id);
	const categories = await Category.find();
	if (!post) return res.redirect('errors/404');
	if (post.user.toString() !== req.user.id && req.user.role !== 'admin')
		return res.redirect('/dashboard');
	res.render('admin/editPost', {
		pageTitle: 'بخش مدیریت | ویرایش پست',
		path: '/dashboard/edit-post',
		user: req.user,
		post,
		categories,
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
		if (post.user.toString() !== req.user.id && req.user.role !== 'admin')
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
					.catch((err) => consola.error(err));
			} else if (thumbnail.mimetype === 'image/png') {
				await sharp(thumbnail.data)
					.png({
						quality: 60,
					})
					.toFile(uploadPath)
					.catch((err) => consola.error(err));
			}
		}

		const { title, status, body, category } = req.body;
		post.title = title;
		post.status = status;
		post.body = body;
		post.category = category;
		post.thumbnail = thumbnail.name ? fileName : post.thumbnail;
		await post.save();
		res.redirect('/dashboard');
	} catch (err) {
		err.inner.forEach((e) => {
			errors.push({ field: e.path, message: e.message });
		});
		return res.render('admin/editPost', {
			pageTitle: 'بخش مدیریت | ویرایش پست',
			path: '/dashboard/edit-post',
			user: req.user,
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
				.catch((err) => consola.error(err));
		} else if (thumbnail.mimetype === 'image/png') {
			await sharp(thumbnail.data)
				.png({
					quality: 60,
				})
				.toFile(uploadPath)
				.catch((err) => consola.error(err));
		}
		await Blog.create({
			...req.body,
			user: req.user.id,
			category: req.body.category,
			thumbnail: fileName,
			slug: req.body.title.replace(/\s+/g, '-'),
		});
		res.redirect('/dashboard');
	} catch (err) {
		err.inner.forEach((e) => {
			errors.push({ field: e.path, message: e.message });
		});
		const categories = await Category.find();
		return res.render('admin/addPost', {
			pageTitle: 'بخش مدیریت | ساخت پست جدید',
			path: '/dashboard/add-post',
			user: req.user,
			errors,
			categories,
		});
	}
};

exports.deletePost = async (req, res) => {
	const post = await Blog.findById(req.params.id);
	if (!post) return res.redirect('errors/404');
	if (post.user.toString() !== req.user.id && req.user.role !== 'admin')
		return res.redirect('/dashboard');
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
				.catch((err) => consola.error(err));
			res.status(200).send(
				`http://localhost:3000/uploads/images/${fileName}`,
			);
		} else if (image.mimetype === 'image/png') {
			await sharp(image.data)
				.png({ quality: 60 })
				.toFile(uploadPath)
				.catch((err) => consola.error(err));
			res.status(200).send(
				`http://localhost:3000/uploads/images/${fileName}`,
			);
		}
	} catch (err) {
		consola.error(err);
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
			user: req.user,
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
		consola.error(err);
		get500(req, res);
	}
};
