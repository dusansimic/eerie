const types = [require('../data/account'),
	require('../data/ban'),
	require('../data/ip-ban'),
	require('../data/login-attempt'),
	require('../data/password-request'),
	require('../data/register-request')];
const methods = require('./sequelize-methods');

module.exports = {
	test: {
		writeAll: () => {
			try {
				types.forEach(async (type, index) => {
					const data = await methods[Object.keys(methods)[index]].findAll();
					const array = [];
					data.forEach(obj => {
						array.push(type.createFromObject(obj));
					});

					console.log(type.name);
					console.log(array);
				});
			} catch (error) {
				console.log('Error happened : ' + error.message);
				console.error(error);
			}
		}
	}
};
