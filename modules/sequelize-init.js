const Sequelize = require('sequelize');
const env = require('./environment-variables');

const mssqlPrep = require('./create-database-mssql');

// Just a place to create the connection instance, and sync up all our tables

module.exports = async function () {
	if (env.databaseType === 'mssql' || env.databaseType === 'mysql' || env.databaseType === 'postgresql') {
		if (env.databaseType === 'mssql') {
			await mssqlPrep();
		} else if (env.databaseType === 'mysql') {
			// This will be filled
		} else if (env.databaseType === 'postgres') {
			// This will be filled
		}
	} else {
		throw new Error('The database dialect you selected doesn\'t exist!');
	}

	const sequelize = new Sequelize({
		host: env.host,
		username: env.authenticationData.username,
		password: env.authenticationData.password,
		dialect: env.databaseType,
		database: 'Authentication',
		dialectOptions: {
			encrypt: Boolean(env.encrypt)
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
