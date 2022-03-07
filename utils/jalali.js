const moment = require('jalali-moment');

exports.formatDate = (date) => {
	return moment(date).locale('fa').format('DD MMMM YYYY');
};
