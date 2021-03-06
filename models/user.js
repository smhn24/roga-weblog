const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { schema } = require('./secure/userValidation');

const userSchema = new mongoose.Schema({
	fullname: {
		type: String,
		required: [true, 'نام و نام خانوادگی الزامی است'],
		trim: true,
	},
	email: {
		type: String,
		required: [true, 'ایمیل الزامی است'],
		unique: true,
	},
	password: {
		type: String,
		required: [true, 'کلمه عبور الزامی است'],
		minLenght: [4, 'کلمه عبور نباید کمتر از 4 کاراکتر باشد'],
		maxLenght: [255, 'کلمه عبور طولانی است'],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	role: {
		type: String,
		enum: ['user', 'admin'],
		default: 'user',
	},
});

userSchema.statics.userValidation = function (body) {
	return schema.validate(body, { abortEarly: false });
};

userSchema.pre('save', async function (next) {
	let user = this;
	if (!user.isModified('password')) return next();
	try {
		user.password = await bcrypt.hash(user.password, 10);
	} catch (err) {
		return next(err);
	}
});

module.exports = mongoose.model('User', userSchema);
