const methods = require('./modules/sequelize-methods');

const asyncReadAll = async () => {
	const [err, data] = await methods.findAll();
	if (err) {
		console.error(err);
	}

	console.log(data);
};

// Const asyncCreateOne = async obj => {
// 	const [err, data] = await methods.create(obj);
// 	if (err) {
// 		console.error(err);
// 	}
//
// 	console.log(data);
// };

// AsyncCreateOne({
// 	id: 'test_id_1',
// 	email: 'test_email@email.email',
// 	password: 'test'
// });

asyncReadAll();
