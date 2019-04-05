const bcrypt = require('bcryptjs');
const express = require('express');

module.exports = async function (methods, config) {
	/*
		Initializing the router
		We'll also create a debugUser for when debug mode is on
		You can login without any users in the database
	 */
	const router = express.Router(); // eslint-disable-line new-cap
	const logger = await require('./logger-provider')('authenticationRouter');

	const filters = require('./router-filters');
	const limiters = await require('./router-limiters')(config);

	let debugUser = null;
	let isDebugUser = null;

	if (config.debug) {
		const Chance = require('chance');
		const chance = new Chance();
		debugUser = {
			id: chance.first({gender: 'female'}),
			password: chance.last()
		};
		logger.debug('debugUser initiated: ');
		logger.debug(debugUser);
		router.debugUser = debugUser;

		isDebugUser = (identification, password) => {
			return identification === debugUser.id && password === debugUser.password;
		};

		config.debugUser = debugUser;
		config.isDebugUser = isDebugUser;
	}

	/*
		We're checking if the user is already logged in.
		If it is, we need to check if the password is still the same.
	 */
	router.use(async (req, res, next) => {
		/*
			Gathering the ip, and creating the object ready to put into the database.
			(1st middleware)
		 */
		let ip = req.connection.remoteAddress;
		ip = ip.substring(ip.lastIndexOf(':') + 1);
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
			if (isDebugUser(req.session.token.id, req.session.token.password)) {
				/*
			 		We will return next here, and the event won't be triggered.
			 		We can't quite database a request for an account that exists
			 		In the context of only one instance
				  */
				req.account = debugUser;
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
			if (req.session.token && (req.session.token.id !== debugUser.id)) {
				requestEntry.accountId = req.session.token.id;
			}

			// Console.log(requestEntry);
			methods.requests.create(requestEntry);
		});
		return next();
	});

	const loginMethod = require('./routes/login')(methods, config);
	router.post('/login', limiters.limitLogin, filters.filterLogin, loginMethod);

	/*
		Register is three part
		First, you create a token. With, some necessary data provided.
		Second, when you get a token, you come here and check if it's still valid.
		Third, when you know it's still valid, provide the other necessary data
		And the account is created.
	 */
	const registerTokenMethod = require('./routes/register-token')(methods, config);
	router.post('/register/token', limiters.limitRegisterTokenCreate, filters.filterRegisterTokenCreate, registerTokenMethod);

	const registerValidMethod = require('./routes/register-valid')(methods, config);
	router.post('/register/valid', limiters.limitRegisterTokenCheck, filters.filterRegisterTokenCheck, registerValidMethod);

	const registerFinalMethod = require('./routes/register-final')(methods, config);
	router.post('/register/final', limiters.limitRegisterFinish, filters.filterRegisterFinish, registerFinalMethod);

	router.use(async (req, res, next) => {
		/*
			This is a gate for logged in users.
			Past this, users must be logged in.
			Will check if users info is still relevant
			(2nd middleware)
		 */
		if (!req.session.token) {
			return next({code: 403, message: 'You are not logged in!'});
		}

		return next();
	});

	/*
		This requests has no filters, and no data will be used.
		Testing request used just to test
		Can be used to see as who you are logged in.
		(For now, but will be used to provide users data)
	 */
	const meMethod = require('./routes/me')();
	router.get('/me', meMethod);

	/*
		This requests has no filters, and no data will be used.
		Just to clear the token
	 */
	const logoutMethod = require('./routes/logout')();
	router.post('/logout', logoutMethod);

	router.use((error, req, res, _) => {
		/*
			The default error handler!
			Something to write into logs,
			and notify the user about it.
		 */
		logger.error('|ERROR| -> ' + error.message);
		logger.trace(error);
		return res.status(error.code || 500).send({
			message: error.message || 'Unexpected error occured.',
			error
		});
	});

	return router;
};
