const sequelize = require('./sequelize-init');
const promiseAwaiter = require('./promise-awaiter');

const Accounts = sequelize.import(__dirname + '/data/sequelizer-account');

module.exports = {
	findAll: () => promiseAwaiter(Accounts.findAll({
		raw: true
	})),
	create: account => promiseAwaiter(Accounts.create(account))
};