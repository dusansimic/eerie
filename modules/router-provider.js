const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const express = require('express');

const LoginAttempt = require('../data/login-attempt');

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
	if (config.debug) {
		const Chance = require('chance');
		const chance = new Chance();
		debugUser = {
			id: chance.first({gender: 'female'}),
			password: chance.last(),
			role: 666
		};
		logger.debug('debugUser initiated: ');
		logger.debug(debugUser);
		router.debugUser = debugUser;
	}

	/*
		We're checking if the user is already logged in.
		If it is, we need to check if the password is still the same.
	 */
	router.use(async (req, res, next) => {
		/*
			Gathering the ip, and creating the object ready to put into the database.
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
			if (req.session.token.id === debugUser.id &&
				req.session.token.password === debugUser.password) {
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

			logger.debug(config.options.passwordMethod);
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

	router.post('/login', limiters.limitLogin, filters.filterLogin, async (req, res, next) => {
		try {
			/*
				If the user is logged in
			 */
			if (req.session.token) {
				return next({code: 401, message: 'You are already logged in!'});
			}

			const loginAttempt = {
				ip: req.ip
			};

			/*
				Debug mode login
				Made for testing
			 */
			if (config.debug && (req.body.identification === debugUser.id && req.body.password === debugUser.password)) {
				req.session.token = {
					id: debugUser.id,
					password: debugUser.password
				};
				/*
					If there appears to be a null/true loginAttempt
					That means someone logged in as a debug user.
				 */
				loginAttempt.user = null;
				loginAttempt.success = true;
				await methods.loginAttempts.create(LoginAttempt.createFromObject(loginAttempt));
				return res.status(200).send({
					account: debugUser,
					message: 'Logged in as debug user.'
				});
			}

			/*
				Check provided identification
				And then, if it exists, calculate the comboHash
				And compare it with the one provided
			*/
			const account = await methods.account.findByIdentification(req.body.identification);
			if (!account) {
				/*
					If there appears to be a null/false loginAttempt
					That means someone tried to login as a non existing user.
				 */
				loginAttempt.user = null;
				loginAttempt.success = false;
				await methods.loginAttempts.create(LoginAttempt.createFromObject(loginAttempt));
				return next({code: 404, message: 'The username/email you entered, does not exist!'});
			}

			if (config.options.passwordMethod === 'SHA256') {
				if (req.body.password !== account.password &&
					(crypto.createHash('sha256').update(req.body.password, 'utf8').digest('hex') !== account.password)) {
					/*
						If there appears to be a id/false loginAttempt
						That means someone tried to login, but entered a wrong password.
					 */
					loginAttempt.user = account.id;
					loginAttempt.success = false;
					await methods.loginAttempts.create(LoginAttempt.createFromObject(loginAttempt));
					return next({code: 400, message: 'The password you entered, is not correct!'});
				}
			} else if (config.options.passwordMethod === 'bcrypt') {
				if (!bcrypt.compareSync(req.body.password, account.password)) {
					loginAttempt.user = account.id;
					loginAttempt.success = false;
					await methods.loginAttempts.create(LoginAttempt.createFromObject(loginAttempt));
					return next({code: 400, message: 'The password you entered, is not correct!'});
				}
			}

			/*
				Account can't be banned and let you to login
			 */
			const ban = await methods.bans.findByUser(account.id);
			if (ban) {
				const json = ban.dataValues;
				const now = new Date();

				if (json.dateFrom.getTime() <= now.getTime() && json.dateTo.getTime() >= now.getTime()) {
					if (req.session.token) {
						delete req.session.token;
					}

					loginAttempt.user = account.id;
					loginAttempt.success = false;
					await methods.loginAttempts.create(LoginAttempt.createFromObject(loginAttempt));
					return next({code: 403, message: 'Your account was banned.', ban: {
						reason: json.reason,
						dateFrom: json.dateFrom,
						dateTo: json.dateTo
					}});
				}
			}

			req.session.token = {
				id: account.id,
				password: account.password
			};

			/*
				If there appears to be a id/true loginAttempt
				That means someone tried to login and did so.
			 */
			loginAttempt.user = account.id;
			loginAttempt.success = true;
			await methods.loginAttempts.create(LoginAttempt.createFromObject(loginAttempt));

			return res.status(200).send({
				account
			});
		} catch (error) {
			return next(error);
		}
	});

	/*
		Register is three part
		First, you create a token. With, some necessary data provided.
		Second, when you get a token, you come here and check if it's still valid.
		Third, when you know it's still valid, provide the other necessary data
		And the account is created.
	 */
	router.post('/register/token', limiters.limitRegisterTokenCreate, filters.filterRegisterTokenCreate, async (req, res, next) => {
		try {
			/*
				If the config says that no roles can be created by the role -1.
				That means you have to be logged in, and have a role in the config.
			 */
			if (config.options.rolesCreateRoles[-1] && !req.account) {
				return next({code: 403, message: 'You are not logged in!'});
			}

			if (!config.options.rolesCreateRoles[req.account.role]) {
				return next({code: 403, message: 'You are not permitted to create an account!'});
			}

			if (!config.options.rolesCreateRoles[req.account.role].includes(req.body.role)) {
				return next({code: 403, message: 'You are not permitted to create an account with that role!'});
			}

			const {role} = req.account;
			const roles = config.options.rolesCreateRoles[req.account.role];

			return res.status(200).send({
				role,
				roles
			});
		} catch (error) {
			return next(error);
		}
	});

	router.post('/register/valid', limiters.limitRegisterTokenCheck, filters.filterRegisterTokenCheck, async (req, res, next) => {
		try {
			/*
				If the option to login after register is enabled
				Need to check if it is logged in
			 */
			if (config.options.loginAfterRegister) {
				if (req.session.token) {
					return next({code: 401, message: 'You are already logged in!'});
				}
			}

			const request = await methods.registerRequests.findByToken(req.body.token);
			if (!request) {
				return next({code: 404, message: 'The token you provided does not exist!'});
			}

			// If (config.options.loginAfterRegister) {
			// 	req.session.token = {
			// 		id: account.id,
			// 		password: account.password
			// 	};
			// }

			return res.status(200).send({
				request
			});
		} catch (error) {
			return next(error);
		}
	});

	router.post('/register/final', limiters.limitRegisterFinish, filters.filterRegisterFinish, async (req, res, next) => {
		try {
			/*
				If the option to login after register is enabled
				Need to check if it is logged in
			 */
			if (config.options.loginAfterRegister) {
				if (req.session.token) {
					return next({code: 401, message: 'You are already logged in!'});
				}
			}

			const request = await methods.registerRequests.findByToken(req.body.token);
			if (!request) {
				return next({code: 404, message: 'The token you provided does not exist!'});
			}

			// If (config.options.loginAfterRegister) {
			// 	req.session.token = {
			// 		id: account.id,
			// 		password: account.password
			// 	};
			// }

			return res.status(200).send({
				request
			});
		} catch (error) {
			return next(error);
		}
	});

	router.use(async (req, res, next) => {
		/*
			This is a gate for logged in users.
			Past this, users must be logged in.
			Will check if users info is still relevant
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
	router.get('/me', async (req, res, _) => {
		return res.status(200).send({
			account: req.account
		});
	});

	/*
		This requests has no filters, and no data will be used.
		Just to clear the token
	 */
	router.post('/logout', async (req, res, _) => {
		delete req.session.token;
		return res.status(200).send({
			message: 'You have successfully logged out!'
		});
	});

	/*
	 	Router.get('/test/notImplemented', async (req, res, next) => {
	  		return next(new Error('This request is not implemented!'));
	 	});
	*/

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
