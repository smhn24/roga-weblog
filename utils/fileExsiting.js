const { access } = require('fs/promises');

exports.fileExist = async (path) => {
	try {
		await access(path);
		return true;
	} catch {
		return false;
	}
};
