exports.getDashboard = async (req, res) => {
	res.render('private/blogs', {
		pageTitle: 'بخش مدیریت | داشبورد',
		path: '/dashboard',
		layout: './layouts/dashboardLayout',
		fullname: req.user.fullname,
	});
};
