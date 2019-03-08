module.exports = {
	databaseType: process.env.EERIE_DATABASE,
	host: process.env.EERIE_HOST,
	authenticationData: {
		username: process.env.EERIE_AUTH_USERNAME,
		password: process.env.EERIE_AUTH_PASSWORD
	}
};
