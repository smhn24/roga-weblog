const multer = require('multer');

exports.storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, './public/uploads/');
	},
});

exports.fileFilter = (req, file, cb) => {
	if (file.mimetype == 'image/png' || file.mimetype == 'image/jpeg') {
		cb(null, true);
	} else {
		cb('در حال حاضر فقط JPEG و PNG پشتیبانی میشود.', false);
	}
};
