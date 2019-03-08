const bcrypt = require('bcryptjs');
const Account = require('./modules/data/account');
const methods = require('./modules/sequelize-methods');

const asyncReadAll = async () => {
	const [err, data] = await methods.findAll();
	if (err) {
		console.error(err);
	}

	const accs = [];
	data.forEach(acc => {
		accs.push(Account.createFromObject(acc));
	});
	console.log(accs);

	accs.forEach(acc => {
		const salt = bcrypt.getSalt(acc.password);
		console.log(salt);
	});
};

// Const asyncCreateOne = async obj => {
// 	const [err, data] = await methods.create(obj);
// 	if (err) {
// 		console.error(err);
// 	}
//
// 	console.log(data);
// };

asyncReadAll();
// AsyncCreateOne(newAcc);
