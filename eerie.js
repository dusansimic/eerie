const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const morgan = require('morgan');

const loggerProvider = require('./modules/logger-provider');

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
	const logger = await loggerProvider('httpServer');

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

	const router = await require('./modules/router-provider')(methods);
	application.use('/', router);

	application.use((err, req, res, next) => {
		if (next) {
			next();
		}
		logger.error('|ERROR| -> ' + err.message);
		logger.trace(err);
		return res.status(err.code || 500).send({
			message: err.message || 'Unexpected error occured.',
			error: err
		});
	});

	application.methods = methods;
	return application;
};
