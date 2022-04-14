const { get404 } = require('../controllers/errorController');

exports.authenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	get404(req, res);
};

exports.notAuthenticated = (req, res, next) => {
	if (!req.isAuthenticated()) {
		return next();
	}
	return res.redirect('/dashboard');
};
