const Yup = require('yup');

exports.imageValidation = Yup.object().shape({
	name: Yup.string().required('جهت آپلود تصویر ابتدا آن را انتخاب کنید'),
	size: Yup.number().max(
		1024 * 1024 * 4,
		'حجم فایل بیش از حد مجاز است | عکس باید کوچکتر از 4 مگابایت باشد',
	),
	mimetype: Yup.mixed().oneOf(
		['image/jpeg', 'image/png'],
		'تنها پسوند های png و jpeg پشتیبانی می شوند',
	),
});
