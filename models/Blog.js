const mongoose = require('mongoose');

const blogSchema = new monolog.Schema({
	title: {
		type: String,
		required: true,
		trim: true,
		minlength: 5,
		maxlength: 255,
	},
	body: {
		type: String,
		required: true,
		trim: true,
	},
	status: {
		type: String,
		default: 'عمومی',
		enum: ['عمومی', 'خصوصی'],
	},
	users: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
});

module.exports = mongoose.model('Blog', blogSchema);
