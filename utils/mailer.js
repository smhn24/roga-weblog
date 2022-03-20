const nodeMailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const transporterDetails = smtpTransport({
	host: 'mail.smh-nabavi.ir',
	port: 465,
	secure: true,
	auth: {
		user: 'weblog@smh-nabavi.ir',
		pass: process.env.EMAIL_PASSWORD,
	},
	tls: {
		rejectUnauthorized: false,
	},
});

exports.sendEmail = (email, fullname, subject, message) => {
	const transporter = nodeMailer.createTransport(transporterDetails);
	transporter.sendMail({
		from: 'weblog@smh-nabavi.ir',
		to: email,
		subject: subject,
		html: `<h1>سلام ${fullname} عزیز</h1><br>
			<p>${message}</p>`,
	});
};
