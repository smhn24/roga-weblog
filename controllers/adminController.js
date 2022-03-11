const multer = require('multer');
const sharp = require('sharp');
const shortid = require('shortid');

const Blog = require('../models/Blog');
const { formatDate } = require('../utils/jalali');
const { get500 } = require('./errorController');
const { storage, fileFilter } = require('../utils/multer');

exports.getDashboard = async (req, res) => {
	try {
		const blogs = await Blog.find({ user: req.user.id });
		res.render('private/blogs', {
			pageTitle: 'بخش مدیریت | داشبورد',
			path: '/dashboard',
			layout: './layouts/dashboardLayout',
			fullname: req.user.fullname,
			blogs,
			formatDate,
		});
	} catch (err) {
		console.log(err);
		get500(req, res);
	}
};

exports.getAddPosts = (req, res) => {
	res.render('private/addPost', {
		pageTitle: 'بخش مدیریت | ساخت پست جدید',
		path: '/dashboard/add-post',
		layout: './layouts/dashboardLayout',
		fullname: req.user.fullname,
	});
};

exports.createPost = async (req, res) => {
	const errors = [];
	try {
		await Blog.postValidation(req.body);
		await Blog.create({ ...req.body, user: req.user.id });
		res.redirect('/dashboard');
	} catch (err) {
		err.inner.forEach((e) => {
			errors.push({ name: e.path, message: e.message });
		});
		return res.render('private/addPost', {
			pageTitle: 'بخش مدیریت | ساخت پست جدید',
			path: '/dashboard/add-post',
			layout: './layouts/dashboardLayout',
			fullname: req.user.fullname,
			errors,
		});
	}
};

exports.uploadImage = (req, res) => {
	const upload = multer({
		limits: { fileSize: 2000000 },
		fileFilter,
	}).single('image');

	upload(req, res, async (err) => {
		if (err) {
			if (err.code === 'LIMIT_FILE_SIZE')
				return res
					.status(400)
					.send('حجم فایل نباید بیشتر از 2 مگابایت باشد');
			res.status(400).send(err);
		} else {
			if (req.file) {
				const fileName = `${shortid.generate()}_${
					req.file.originalname
				}`;
				if (req.file.mimetype === 'image/jpeg') {
					await sharp(req.file.buffer)
						.jpeg({
							quality: 60,
						})
						.toFile(`./public/uploads/${fileName}`)
						.catch((err) => console.log(err));
				} else if (req.file.mimetype === 'image/png') {
					await sharp(req.file.buffer)
						.png({
							quality: 60,
						})
						.toFile(`./public/uploads/${fileName}`)
						.catch((err) => console.log(err));
				}
				res.status(200).send(
					`http://localhost:3000/uploads/${fileName}`,
				);
			} else {
				res.send('هنوز عکسی انتخاب نشده است');
			}
		}
	});
};
