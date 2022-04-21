const nodeMailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const nunjucks = require('nunjucks');

const transporterDetails = smtpTransport({
	host: process.env.EMAIL_HOST,
	port: 465,
	secure: true,
	auth: {
		user: process.env.EMAIL_USERNAME,
		pass: process.env.EMAIL_PASSWORD,
	},
	tls: {
		rejectUnauthorized: false,
	},
});

exports.sendEmail = (to, fullname, subject, message) => {
	const transporter = nodeMailer.createTransport(transporterDetails);

	const html = nunjucks.render('../views/email/email.njk', {
		fullname,
		message,
	});

	transporter.sendMail(
		{
			from: process.env.EMAIL_USERNAME,
			to,
			subject,
			html: html,
		},
		(err, info) => {
			if (err) {
				consola.error(err);
			}
		},
	);
};
