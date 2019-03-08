const bcrypt = require('bcryptjs');
const Account = require('./modules/data/account');
const methods = require('./modules/sequelize-methods');

const asyncReadAll = async () => {
	let [err, data] = await methods.findAll();
	if (err) {
		console.error(err);
	}
	let accs = [];
	data.forEach(acc => {
		accs.push(Account.createFromObject(acc));
	});
	console.log(accs);

	accs.forEach(acc => {
		let salt = bcrypt.getSalt(acc.password);
		console.log(salt);
	});
};

const asyncCreateOne = async obj => {
	let [err, data] = await methods.create(obj);
	if (err) {
		console.error(err);
	}
	console.log(data);
};

const newAcc = {
	id: 'yellowboihashed',
	username: 'yellowboi',
	password: bcrypt.hashSync('yellowyellowyellowyellowyellowyellowyellowyellowyellowyellow', 10),
	email: 'email@email.email',
	createdAt: new Date(),
	updatedAt: new Date()
};

asyncReadAll();
// asyncCreateOne(newAcc);