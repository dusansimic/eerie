const express = require('express');
const session = require('express-session');

async function initServer() {
	/*
		Let's pull the methods only when the server
	 	is actually about to be initialized
	*/
	const methods = await require('./modules/sequelize-methods')();
	const Store = require('connect-session-sequelize')(session.Store);

	/*
		We create the app, and add all the middleware necessary
	 */
	const application = express();

	application.use(session({
		secret: 'hello',
		store: new Store({
			db: methods._extra.sequelize
		}),
		resave: true,
		saveUninitialized: true
	}));

	application.methods = methods;

	return application;
}

module.exports = initServer;
