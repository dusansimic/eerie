const path = require('path');
const bcrypt = require('bcryptjs');
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

const eerie = async function (config) {
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
	application.methods = methods;

	let debugUser = null;
	let isDebugUser = null;

	if (config.debug) {
		const Chance = require('chance');
		const chance = new Chance();
		debugUser = {
			id: chance.first({gender: 'female'}),
			password: chance.last()
		};

		application.debugUser = debugUser;

		isDebugUser = (identification, password) => {
			return identification === debugUser.id && password === debugUser.password;
		};

		config.debugUser = debugUser;
		config.isDebugUser = isDebugUser;

		application.get('/debug', async (req, res, _) => {
			const {auth} = config.nodemailer.options;

			return res.render('debug', {
				debugUser: config.debugUser,
				emailUser: {
					user: auth.user,
					pass: auth.pass
				}
			});
		});
	}

	/*
		We're checking if the user is already logged in.
		If it is, we need to check if the password is still the same.
	*/
	application.use(async (req, res, next) => {
		/*
			Gathering the ip, and creating the object ready to put into the database.
			(1st middleware)
		 */

		let ip = req.connection.remoteAddress;
		if (ip.lastIndexOf(':') !== -1) {
			ip = ip.substring(ip.lastIndexOf(':') + 1);
		}

		if (ip.split('.').length !== 4) {
			ip = '127.0.0.1';
		}

		/*
			Check with ipBans, if the IP is banned.
		 */
		const ipBan = await methods.ipBans.findByIp(ip);
		if (ipBan) {
			const json = ipBan.dataValues;
			const now = new Date();

			if (json.dateFrom.getTime() <= now.getTime() && json.dateTo.getTime() >= now.getTime()) {
				if (req.session.token) {
					delete req.session.token;
				}

				return next({code: 403, message: 'Your IP address was banned.', ipBan: {
					ip: json.ip,
					reason: json.reason,
					dateFrom: json.dateFrom,
					dateTo: json.dateTo
				}});
			}
		}

		req.ip = ip;

		if (req.session.token) {
			/*
				Query the database for the user
				Or check if the user matches the debugUser
			 */
			if (config.debug && config.isDebugUser(req.session.token.id, req.session.token.password)) {
				/*
			 		We will return next here, and the event won't be triggered.
			 		We can't quite database a request for an account that exists
			 		In the context of only one instance
				  */
				req.account = config.debugUser;
				return next();
			}

			const account = await methods.account.findById(req.session.token.id);

			/*
				No more account -> The account has been deleted
				If the password is changed -> Just logging out previous sessions
			 */
			if (!account) {
				delete req.session.token;
				return next({code: 401, message: 'You have been logged out!'});
			}

			// Logger.debug(config.options.passwordMethod);
			switch (config.options.passwordMethod) {
				case 'SHA256':
					if (req.session.token.password !== account.password) {
						delete req.session.token;
						return next({code: 401, message: 'You have been logged out!'});
					}

					break;
				case 'bcrypt':
					if (!bcrypt.compareSync(req.session.token.password, account.password)) {
						delete req.session.token;
						return next({code: 401, message: 'You have been logged out!'});
					}

					break;
				default:
					throw new Error('You haven\'t specified a password hashing method!');
			}

			const ban = await methods.bans.findByUser(account.id);
			if (ban) {
				const json = ban.dataValues;
				const now = new Date();

				if (json.dateFrom.getTime() <= now.getTime() && json.dateTo.getTime() >= now.getTime()) {
					if (req.session.token) {
						delete req.session.token;
					}

					return next({code: 403, message: 'Your account was banned.', ban: {
						reason: json.reason,
						dateFrom: json.dateFrom,
						dateTo: json.dateTo
					}});
				}
			}

			req.account = account;
		}

		/*
			We want to log any requests that have finished
			This is where the object is created
			And also, saved to the database.
		 */
		res.on('finish', () => {
			/*
				Creating the object to place into the database
			 */
			const requestEntry = {
				ip,
				requestPath: req.path,
				date: new Date(),
				statusCode: res.statusCode
			};
			if (req.session.token) {
				if (!(config.debug && req.session.token.id === config.debugUser.id)) {
					requestEntry.accountId = req.session.token.id;
				}
			}

			// Console.log(requestEntry);
			methods.requests.create(requestEntry);
		});
		return next();
	});

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
		application,
		models: methods.extra,
		defaultErrorHandler,
		async start() {
			const router = await require('./modules/router-provider')(application.methods, config);

			if (config.debug) {
				application.debugUser = router.debugUser;
			}

			application.use('/', router);

			application.use(defaultErrorHandler);

			return application;
		}
	};
};

module.exports = eerie;
