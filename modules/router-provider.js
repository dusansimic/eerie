const path = require('path');
const express = require('express');

const {pugEngine} = require('nodemailer-pug-engine');

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

	config.nodemailer.use('compile', pugEngine({
		templateDir: path.join(__dirname, '../templates'),
		pretty: true
	}));

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
