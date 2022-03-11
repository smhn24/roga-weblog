const multer = require('multer');
const uuid = require('uuid').v4;

exports.storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, './public/uploads/');
	},
	filename: (req, file, cb) => {
		cb(null, `${uuid()}_${file.originalname}`);
	},
});

exports.fileFilter = (req, file, cb) => {
	if (file.mimetype == 'image/png' || file.mimetype == 'image/jpeg') {
		cb(null, true);
	} else {
		cb('در حال حاضر فقط JPEG و PNG پشتیبانی میشود.', false);
	}
};
