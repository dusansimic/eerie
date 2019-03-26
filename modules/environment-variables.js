/*
	Need to drag in some basic data
	Necessary for Sequelize initialization
	Later will be adapted with database info, email options...
 */

module.exports = {
	debug: Boolean(process.env.EERIE_DEBUG),
	secret: process.env.EERIE_SESSION_SECRET,
	options: {
		loginAfterRegister: Boolean(process.env.EERIE_LOGIN_AFTER_REGISTER),
		passwordMethod: process.env.EERIE_PASSWORD_METHOD
	},
	sequelize: {
		databaseType: process.env.EERIE_DATABASE,
		host: process.env.EERIE_HOST,
		encrypt: Boolean(process.env.EERIE_ENCRYPT || false),
		initial: process.env.EERIE_INITIAL,
		authenticationData: {
			username: process.env.EERIE_AUTH_USERNAME,
			password: process.env.EERIE_AUTH_PASSWORD
		}
	},
	redis: {
		host: process.env.EERIE_REDIS_HOST,
		ssl: Boolean(process.env.EERIE_REDIS_SSL),
		password: process.env.EERIE_REDIS_PASSWORD
	}
};
