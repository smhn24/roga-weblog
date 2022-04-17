const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'نام دسته بندی الزامی است'],
		trim: true,
	},
});

categorySchema.index({ name: 'text' });

module.exports = mongoose.model('Category', categorySchema);
