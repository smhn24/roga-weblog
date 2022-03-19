const mongoose = require('mongoose');

const { schema } = require('./secure/postValidation');

const blogSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true,
		minlength: 5,
		maxlength: 100,
	},
	body: {
		type: String,
		required: true,
		trim: true,
	},
	status: {
		type: String,
		default: 'public',
		enum: ['public', 'private'],
	},
	thumbnail: {
		type: String,
		required: true,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
});

blogSchema.statics.postValidation = function (body) {
	return schema.validate(body, { abortEarly: false });
};

module.exports = mongoose.model('Blog', blogSchema);
