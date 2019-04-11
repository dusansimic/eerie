const path = require('path');
const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const cors = require('cors');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const morgan = require('morgan');
const Sequelize = require('sequelize');
const Redis = require('ioredis');
const nodemailer = require('nodemailer');

const loggerProvider = require('./modules/logger-provider');

const Eerie = async function (config) {
	/*
		Initializing some basics to create the server.
		If there is also something wrong with the config, throw an Error
	 */
	const logger = await loggerProvider('httpServer');
	await require('./modules/config-analyzer')(config);

	config.sequelize = new Sequelize(config.sequelizeConfig);
	config.redis = new Redis(config.redisConfig);

	const transporterConfig = {
		auth: {
			user: config.nodemailerConfig.username,
			pass: config.nodemailerConfig.password
		}
	};

	if (config.nodemailerConfig.service === 'gmail') {
		transporterConfig.service = config.nodemailerConfig.service;
	} else if (config.nodemailerConfig.service === 'ethereal') {
		const testData = await nodemailer.createTestAccount();
		transporterConfig.host = testData.smtp.host;
		transporterConfig.port = testData.smtp.port;
		transporterConfig.auth = {
			user: testData.user,
			pass: testData.pass
		};
	} else {
		transporterConfig.host = config.nodemailerConfig.host;
		transporterConfig.port = config.nodemailerConfig.port;
	}

	config.nodemailer = nodemailer.createTransport(transporterConfig);

	if (!config.application) {
		config.application = express();
	}

	config.application.set('views', path.join(__dirname, 'views'));
	config.application.set('view engine', 'pug');

	/*
		All the middleware necessary
		First, the church of cross origin requests
		Second, the land of json-s
		Third, the tale teller Morgan
		Fourth, the everyone's whisperer
		And fifth, the router who connects everyone...
	*/
	config.application.use(cors({
		origin(origin, callback) {
			callback(null, true);
		},
		credentials: true
	}));

	config.application.use(bodyParser.json());

	if (config.debug) {
		config.application.use(morgan('dev'));
	}

	config.application.use(session({
		reqid: uuid,
		secret: config.secret,
		store: new RedisStore({
			client: config.redis
		}),
		resave: true,
		saveUninitialized: true
	}));

	const methods = await require('./modules/sequelize-methods')(config.sequelize);
	config.application.methods = methods;

	const defaultErrorHandler = (err, req, res, next) => {
		if (next) {
			next();
		}

		logger.error('|ERROR| -> ' + err.message);
		logger.trace(err);
		return res.status(err.code || 500).send({
			message: err.message || 'Unexpected error occured.',
			error: err
		});
	};

	return {
		models: methods.extra,
		defaultErrorHandler,
		async start() {
			const router = await require('./modules/router-provider')(config.application.methods, config);

			if (config.debug) {
				config.application.debugUser = router.debugUser;
			}

			config.application.use('/', router);

			config.application.use(defaultErrorHandler);

			return config.application;
		}
	};
};

module.exports = Eerie;
