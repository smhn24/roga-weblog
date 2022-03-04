const User = require('../models/user');

exports.login = (req, res) => {
	res.render('login', { pageTitle: 'ورود به بخش مدیریت', path: '/login' });
};

exports.register = (req, res) => {
	res.render('register', {
		pageTitle: 'ثبت نام کاربر جدید',
		path: '/register',
	});
};

exports.createUser = async (req, res) => {
	const errors = [];
	try {
		await User.userValidation(req.body);
		const { email } = req.body;
		const user = await User.findOne({ email });
		if (user) {
			errors.push({ message: 'کاربری با این ایمیل از قبل موجود است' });
			return res.render('register', {
				pageTitle: 'ثبت نام کاربر جدید',
				path: '/register',
				errors,
			});
		}
		await User.create(req.body);
		// const { fullname, email, password } = req.body;
		// const user = new User({ fullname, email, password });
		// user.save()
		// 	.then((user) => {
		// 		console.log(user);
		// 		res.redirect('/users/login');
		// 	})
		// 	.catch((err) => {
		// 		if (err) throw err;
		// 	});
	} catch (err) {
		console.log(err);
		err.inner.forEach((e) => {
			errors.push({ name: e.path, message: e.message });
		});
		return res.render('register', {
			pageTitle: 'ثبت نام کاربر جدید',
			path: '/register',
			errors,
		});
	}
};
