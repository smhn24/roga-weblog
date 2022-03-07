exports.get404 = (req, res) => {
	res.render('errors/404', {
		pageTitle: 'صفحه پیدا نشد | 404',
		path: '/404',
	});
};

exports.get500 = (req, res) => {
	res.render('errors/500', {
		path: '/500',
		pageTitle: 'خطای سرور | 500',
	});
};
