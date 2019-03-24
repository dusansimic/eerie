const express = require('express');
const session = require('express-session');
const Redis = require('ioredis');
const RedisStore = require('connect-redis')(session);
const cors = require('cors');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const morgan = require('morgan');

const loggerProvider = require('./modules/logger-provider');
const env = require('./modules/environment-variables');

module.exports = async function () {
	/*
		Let's pull the methods only when the server
	 	is actually about to be initialized
	*/
	const sequelize = await require('./modules/sequelize-init')();
	const methods = await require('./modules/sequelize-methods')(sequelize);

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

	const redisConfig = {
		host: env.redis.host,
		password: env.redis.password
	};

	if (env.redis.ssl) {
		redisConfig.tls = true;
		redisConfig.port = 6380;
	} else {
		redisConfig.port = 6379;
	}

	const client = new Redis(redisConfig);

	application.use(session({
		reqid: () => uuid(),
		secret: 'hello',
		store: new RedisStore({
			client
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
