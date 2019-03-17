// Need to drag in some basic data
// Necessary for Sequelize initialization
// Later will be adapted with database info, email options...

module.exports = {
	databaseType: process.env.EERIE_DATABASE,
	host: process.env.EERIE_HOST,
	encrypt: process.env.EERIE_ENCRYPT || null,
	initial: process.env.EERIE_INITIAL,
	authenticationData: {
		username: process.env.EERIE_AUTH_USERNAME,
		password: process.env.EERIE_AUTH_PASSWORD
	}
};
