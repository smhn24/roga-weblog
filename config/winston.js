const winston = require('winston');
const appRoot = require('app-root-path');

const options = {
	File: {
		level: 'info',
		filename: `${appRoot}/logs/app.log`,
		handleExceptions: true,
		format: winston.format.json(),
		maxsize: 5242880, // 5MB
		maxfile: 5,
	},
};

const logger = new winston.createLogger({
	transports: [new winston.transports.File(options.File)],
	exitOnError: false,
});

logger.stream = {
	write: function (message) {
		logger.info(message);
	},
};

module.exports = logger;
