const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	fullname: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
		minLenght: 4,
		maxLenght: 255,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
