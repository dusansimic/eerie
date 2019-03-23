// Need to drag in some basic data
// Necessary for Sequelize initialization
// Later will be adapted with database info, email options...

module.exports = {
	debug: process.env.EERIE_DEBUG,
	databaseType: process.env.EERIE_DATABASE,
	host: process.env.EERIE_HOST,
	encrypt: process.env.EERIE_ENCRYPT || null,
	initial: process.env.EERIE_INITIAL,
	authenticationData: {
		username: process.env.EERIE_AUTH_USERNAME,
		password: process.env.EERIE_AUTH_PASSWORD
	},
	redis: {
		host: process.env.EERIE_REDIS_HOST,
		ssl: process.env.EERIE_REDIS_SSL,
		password: process.env.EERIE_REDIS_PASSWORD
	}
};
