const path = require('path');
const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const cors = require('cors');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const morgan = require('morgan');

const loggerProvider = require('./modules/logger-provider');

module.exports = async function (config) {
	/*
		Initializing some basics to create the server.
		If there is also something wrong with the config, throw an Error
	 */
	const logger = await loggerProvider('httpServer');
	await require('./modules/config-analyzer')(config);

	const application = express();

	application.set('views', path.join(__dirname, 'views'));
	application.set('view engine', 'pug');

	/*
		All the middleware necessary
		First, the church of cross origin requests
		Second, the land of json-s
		Third, the tale teller Morgan
		Fourth, the everyone's whisperer
		And fifth, the router who connects everyone...
	*/
	application.use(cors({
		origin(origin, callback) {
			callback(null, true);
		},
		credentials: true
	}));

	application.use(bodyParser.json());

	if (config.debug) {
		application.use(morgan('dev'));
	}

	application.use(session({
		reqid: uuid,
		secret: config.secret,
		store: new RedisStore({
			client: config.redis
		}),
		resave: true,
		saveUninitialized: true
	}));

	const methods = await require('./modules/sequelize-methods')(config.sequelize);
	const router = await require('./modules/router-provider')(methods, config);

	if (config.debug) {
		application.debugUser = router.debugUser;
		application.methods = methods;
	}

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

	return application;
};
