const Yup = require('yup');

exports.schema = Yup.object().shape({
	title: Yup.string()
		.required('وارد کردن عنوان پست الزامی است')
		.min(5, 'عنوان پست نباید کمتر از 5 کاراکتر باشد')
		.max(100, 'عنوان پست بسیار طولانی است'),
	body: Yup.string().required('پست جدید باید دارای محتوا باشد'),
	status: Yup.mixed().oneOf(
		['public', 'private'],
		'حتما یکی از 2 وضعیت عمومی یا خصوصی باید انتخاب شود',
	),
	thumbnail: Yup.object().shape({
		name: Yup.string().required('وارد کردن عکس بند انگشتی الزامی است'),
		size: Yup.number().max(
			1024 * 1024 * 3,
			'عکس بند انگشتی نباید بیشتر از 3 مگابایت باشد',
		),
		mimetype: Yup.mixed().oneOf(
			['image/jpeg', 'image/png'],
			'در حال حاضر فقط JPEG و PNG پشتیبانی میشود.',
		),
	}),
});
