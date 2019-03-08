const path = require('path');

const sequelize = require('./sequelize-init');
const promiseAwaiter = require('./promise-awaiter');

const Accounts = sequelize.import(path.join(__dirname, '/data/sequelizer-account'));

module.exports = {
	findAll: () => promiseAwaiter(Accounts.findAll({
		raw: true
	})),
	create: account => promiseAwaiter(Accounts.create(account))
};
