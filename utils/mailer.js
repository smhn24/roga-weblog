const nodeMailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const transporterDetails = smtpTransport({
	host: 'mail.smh-nabavi.ir',
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

	transporter.sendMail(
		{
			from: process.env.EMAIL_USERNAME,
			to,
			subject,
			html: `<h1>سلام ${fullname} عزیز</h1><br>
			<p>${message}</p>`,
		},
		(err, info) => {
			if (err) {
				console.log(err);
			} else {
				console.log(info.response);
			}
		},
	);
};
