const Sequelize = require('sequelize');
const env = require('./environment-variables');

const sequelize = new Sequelize({
	host: env.host,
	username: env.authenticationData.username,
	password: env.authenticationData.password,
	dialect: env.databaseType
});

sequelize.sync();

module.exports = sequelize;
