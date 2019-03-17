const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const morgan = require('morgan');

module.exports = async function () {
	/*
		Let's pull the methods only when the server
	 	is actually about to be initialized
	*/
	const sequelize = await require('./modules/sequelize-init')();
	const methods = await require('./modules/sequelize-methods')(sequelize);
	const SequelizeStore = require('connect-session-sequelize')(session.Store);

	/*
		We create the app, and add all the middleware necessary
	*/
	const application = express();

	application.use(cors({
		origin(origin, callback) {
			callback(null, true);
		},
		credentials: true
	}));

	application.use(bodyParser.json());

	application.use(morgan('dev'));

	application.use(session({
		reqid: () => uuid(),
		secret: 'hello',
		store: new SequelizeStore({
			db: sequelize
		}),
		resave: true,
		saveUninitialized: true
	}));

	application.methods = methods;
	return application;
};
