const Sequelize = require('sequelize');
const env = require('./environment-variables');

const mssql_prep = require('./create-database-mssql');

// Just a place to create the connection instance, and sync up all our tables

module.exports = async function () {
	if (env.databaseType === 'mssql' || env.databaseType === 'mysql' || env.databaseType === 'postgresql') {
		if (env.databaseType === 'mssql') {
			await mssql_prep();
		} else if (env.databaseType === 'mysql') {

		} else if (env.databaseType === 'postgres') {

		}
	} else {
		throw new Error('The database dialect you selected doesn\'t exist!');
	}

	let sequelize = new Sequelize({
		host: env.host,
		username: env.authenticationData.username,
		password: env.authenticationData.password,
		dialect: env.databaseType,
		database: 'Authentication',
		dialectOptions: {
			encrypt: !!env.encrypt
		}
	});
	console.log('Authentication connecting to : ' + env.host + ' (' + env.databaseType + ')');
	sequelize.authenticate()
		.then(() => {
			console.log('Connected to the database!');
		})
		.catch(error => {
			console.error(error);
		});

	sequelize.sync();
	return sequelize;
};
