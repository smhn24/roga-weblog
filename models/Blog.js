const { unlink } = require('fs/promises');

const mongoose = require('mongoose');
const appRoot = require('app-root-path');

const { schema } = require('./secure/postValidation');
const { fileExist } = require('../utils/fileExsiting');

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

blogSchema.index({ title: 'text' });

blogSchema.statics.postValidation = function (body) {
	return schema.validate(body, { abortEarly: false });
};

blogSchema.pre('remove', async function (next) {
	const thumbPath = `${appRoot}/public/uploads/thumbnails/${this.thumbnail}`;
	if (await fileExist(thumbPath)) await unlink(thumbPath);
});

module.exports = mongoose.model('Blog', blogSchema);
