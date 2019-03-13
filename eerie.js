const types = [require('./data/account'), require('./data/ban'), require('./data/ip-ban'),
	require('./data/login-attempt'), require('./data/password-request'), require('./data/register-request')];
const methods = require('./modules/sequelize-methods');

const asyncReadAll = async () => {
	try {
		types.forEach(async (type, index) => {
			let data = await methods[Object.keys(methods)[index]].findAll();
			let array = [];
			data.forEach(obj => {
				array.push(type.createFromObject(obj));
			});

			console.log(type.name);
			console.log(array);
		});
	} catch (e) {
		console.log('Error happened : ' + e.message);
		console.error(e);
	}
};

asyncReadAll();
