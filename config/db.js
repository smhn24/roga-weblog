const mongoose = require('mongoose');
const Logger = require('debug')('weblog:database');

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		Logger(`MongoDB Connected: ${conn.connection.host}`);
	} catch (err) {
		Logger(err);
		process.exit(1);
	}
};

module.exports = connectDB;
