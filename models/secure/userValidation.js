const Yup = require('yup');

exports.schema = Yup.object().shape({
	fullname: Yup.string()
		.required('نام و نام خانوادگی الزامی است')
		.min(4, 'نام و نام خانوادگی نباید کمتر از 4 کاراکتر باشد')
		.max(255, 'نام و نام خانوادگی طولانی است'),
	email: Yup.string().email('ایمیل معتبر نیست').required('ایمیل الزامی است'),
	password: Yup.string()
		.required('کلمه عبور وارد نشده است')
		.min(4, 'کلمه عبور نباید کمتر از 4 کاراکتر باشد')
		.max(255, 'کلمه عبور طولانی است'),
	confirmPassword: Yup.string()
		.required('تکرار کلمه عبور الزامی است')
		.oneOf(
			[Yup.ref('password'), null],
			'کلمه عبور و تکرار کلمه عبور یکسان نیستند',
		),
});
