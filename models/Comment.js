const mongoose = require('mongoose');

const { schema } = require('./secure/commentValidation');

const commentSchema = new mongoose.Schema({
	text: {
		type: String,
		required: [true, 'متن کامنت الزامی است'],
		minlength: [4, 'متن کامنت نمیتواند کمتر از 4 کاراکتر باشد'],
		maxlength: [255, 'متن کامنت نمیتواند بیشتر از 255 کاراکتر باشد'],
	},
	commenter: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	blog: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Blog',
	},
	commentedAt: {
		type: Date,
		default: Date.now,
	},
});

commentSchema.statics.commentValidation = function (body) {
	return schema.validate(body, { abortEarly: false });
};

module.exports = mongoose.model('Comment', commentSchema);
