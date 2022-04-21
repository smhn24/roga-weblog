const mongoose = require('mongoose');
const consola = require('consola');

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		consola.success(`MongoDB Connected: ${conn.connection.host}`);
	} catch (err) {
		consola.error(err);
		process.exit(1);
	}
};

module.exports = connectDB;
