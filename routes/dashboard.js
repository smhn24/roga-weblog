const { Router } = require('express');

const router = new Router();

//* @desc Dashboard
//* @route GET /dashboard/
router.get('/', (req, res) => {
	res.render('dashboard', {
		pageTitle: 'بخش مدیریت | داشبورد',
		path: '/dashboard',
		layout: './layouts/dashboardLayout',
	});
});

module.exports = router;
