const { unlink } = require('fs/promises');

const mongoose = require('mongoose');
const appRoot = require('app-root-path');

const { schema } = require('./secure/postValidation');
const { fileExist } = require('../utils/fileExsiting');

const blogSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, 'عنوان الزامی می باشد'],
		minlength: [5, 'عنوان نمیتواند کمتر از 5 کاراکتر باشد'],
		maxlength: [100, 'عنوان نمیتواند بیشتر از 100 کاراکتر باشد'],
	},
	body: {
		type: String,
		required: [true, 'متن الزامی می باشد'],
	},
	status: {
		type: String,
		default: 'public',
		enum: ['public', 'private'],
	},
	thumbnail: {
		type: String,
		required: [true, 'تصویر بند انگشتی الزامی می باشد'],
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Category',
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
