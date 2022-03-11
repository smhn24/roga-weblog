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
});
