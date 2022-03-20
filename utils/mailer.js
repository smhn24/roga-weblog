const nodeMailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const transporterDetails = smtpTransport({
	host: 'mail.smh-nabavi.ir',
	port: 465,
	secure: true,
	auth: {
		user: 'weblog@smh-nabavi.ir',
		pass: 'weblogPassword',
	},
	tls: {
		rejectUnauthorized: false,
	},
});

const transporter = nodeMailer.createTransport(transporterDetails);

const options = {
	from: 'weblog@smh-nabavi.ir',
	to: 'nabavi.1383@gmail.com',
	subject: 'ایمیل از طرف سرور سایت وبلاگ',
	text: 'یک تست ساده از nodemailer',
};

transporter.sendMail(options, (err, info) => {
	if (err) console.log(err);
	console.log(info);
});
