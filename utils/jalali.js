const moment = require('jalali-moment');

exports.formatDate = (date) => moment(date).locale('fa').format('DD MMMM YYYY');
