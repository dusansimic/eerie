const Sequelize = require('sequelize');
const env = require('./environment-variables');

// Just a place to create the connection instance, and sync up all our tables

module.exports = async function () {
	if (!(env.databaseType === 'mssql' || env.databaseType === 'mysql' || env.databaseType === 'postgres')) {
		throw new Error('The database dialect you selected doesn\'t exist!');
	}

	const sequelize = new Sequelize({
		host: env.host,
		username: env.authenticationData.username,
		password: env.authenticationData.password,
		dialect: env.databaseType,
		database: env.initial,
		dialectOptions: {
			encrypt: Boolean(env.encrypt)
		}
	});
	sequelize.sync();
	return sequelize;
};
