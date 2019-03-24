const express = require('express');

const filters = require('./router-filters');
const limiters = require('./router-limiters');
const env = require('./environment-variables');

module.exports = async function (methods) {

	/*
		Initializing the router
		We'll also create a debugUser for when debug mode is on
		You can login without any users in the database
	 */

	const router = express.Router(); // eslint-disable-line new-cap
	const logger = await require('./logger-provider')('authenticationRouter');

	let debugUser = null;
	if (env.debug) {
		const Chance = require('chance');
		const chance = new Chance();
		debugUser = {
			identification: chance.first({gender: 'female'}),
			password: chance.last()
		};
		logger.debug('debugUser initiated: ');
		logger.debug(debugUser);
	}

	/*
		We're checking if the user is already logged in.
		If it is, we need to check if the password is still the same.
	 */
	router.use(async (req, res, next) => {
		if (req.session.token) {
			/*
				Query the database for the user
				Or check if the user matches the debugUser
			 */
			if (req.session.token.identification === debugUser.identification &&
					req.session.token.password === debugUser.password) {
				/*
			 		We will return next here, and the event won't be triggered.
			 		We can't quite database a request for an account that exists
			 		In the context of only one instance
				  */
				return next();
			}

			const account = await methods.account.findByIdentification(req.session.token.identification);
			/*
				No more account -> The account has been deleted
				If the password is changed -> Just logging out previous sessions
			 */
			if (!account || (req.session.token.password !== account.password)) {
				delete req.session.token;
				return next({code: 401, message: 'You have been logged out!'});
			}
		}

		/*
			We want to log any requests that have finished
			This is where the object is created
			And also, saved to the database.
		 */
		res.on('finish', () => {
			/*
				Gathering the ip, and creating the object ready to put into the database.
			 */
			let ip = req.connection.remoteAddress;
			ip = ip.substring(ip.lastIndexOf(':') + 1);
			if (ip.split('.').length !== 4) {
				ip = '127.0.0.1';
			}
			let requestEntry = {
				ip,
				requestPath: req.path,
				date: new Date(),
				statusCode: res.statusCode
			};
			if (req.session.token && (req.session.token.identification !== debugUser.identification)) {
				requestEntry.accountId = req.session.token.identification;
			}
			// console.log(requestEntry);
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

			/*
				Debug mode login
				Made for testing
			 */

			if (env.debug && (req.body.identification === debugUser.identification && req.body.password === debugUser.password)) {
				req.session.token = {
					identification: debugUser.identification,
					password: debugUser.password
				};
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
				return next({code: 404, message: 'The username/email you entered, does not exist!'});
			}
			if (req.body.password !== account.password) {
				return next({code: 400, message: 'The password you entered, is not correct!'});
			}
			req.session.token = {
				identification: account.id,
				password: account.password
			};
			return res.status(200).send({
				account
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
	router.get('/me', async (req, res, next) => {
		return res.status(200).send({
			account: {
				identification: req.session.token.identification,
				password: req.session.token.password
			}
		});
	});

	/*
		This requests has no filters, and no data will be used.
		Just to clear the token
	 */
	router.post('/logout', async (req, res, next) => {
		delete req.session.token;
		return res.status(200).send({
			message: 'You have successfully logged out!'
		});
	});

	/*
	 	router.get('/test/notImplemented', async (req, res, next) => {
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
