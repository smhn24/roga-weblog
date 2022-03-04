const { Router } = require('express');
const { authenticated } = require('../middlewares/auth');

const router = new Router();

//* @desc Dashboard
//* @route GET /dashboard/
router.get('/', authenticated, (req, res) => {
	res.render('dashboard', {
		pageTitle: 'بخش مدیریت | داشبورد',
		path: '/dashboard',
		layout: './layouts/dashboardLayout',
		fullname: req.user.fullname,
	});
});

module.exports = router;
