const Sequelize = require('sequelize');
const env = require('./environment-variables');

// Just a place to create the connection instance, and sync up all our tables

const sequelize = new Sequelize({
	host: env.host,
	username: env.authenticationData.username,
	password: env.authenticationData.password,
	dialect: env.databaseType
});

sequelize.sync();

module.exports = sequelize;
