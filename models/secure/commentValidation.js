const Yup = require('yup');

exports.schema = Yup.object().shape({
	text: Yup.string()
		.required('متن کامنت الزامی است')
		.min(4, 'متن کامنت نمیتواند کمتر از 4 کاراکتر باشد')
		.max(255, 'متن کامنت نمیتواند بیشتر از 255 کاراکتر باشد'),
});
