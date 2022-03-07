const { Router } = require('express');
const { authenticated } = require('../middlewares/auth');

const adminController = require('../controllers/adminController');

const router = new Router();

//* @desc Dashboard
//* @route GET /dashboard/
router.get('/', authenticated, adminController.getDashboard);

module.exports = router;
