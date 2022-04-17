const { get404 } = require('../controllers/errorController');

exports.isAdmin = (req, res, next) => {
	req.user.role === 'admin' ? next() : get404(req, res);
};
