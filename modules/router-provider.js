const express = require('express');

const filters = require('./router-filters');
const limiters = require('./router-limiters');

module.exports = async function (methods) {
	const router = express.Router(); // eslint-disable-line new-cap
	const logger = await require('./logger-provider')('authenticationRouter');

	router.use((req, res, next) => {
		/*
			We want to log any requests that have finished
			This is where the object is created
			And also, saved to the database.
		 */
		res.on('finish', () => {
			let ip = req.connection.remoteAddress.substring(req.connection.remoteAddress.lastIndexOf(':') + 1);
			if (ip.split('.').length !== 4) {
				ip = '127.0.0.1';
			}
			let requestEntry = {
				ip,
				requestPath: req.path,
				date: new Date(),
				statusCode: res.statusCode
			};
			if (req.session.token) {
				requestEntry.accountId = req.session.token.identification;
			}
			// console.log(requestEntry);
			methods.requests.create(requestEntry);
		});
		next();
	});

	router.post('/login', limiters.limitLogin, filters.filterLogin, async (req, res, next) => {
		try {
			/*
				Check provided identification
				And then, if it exists, calculate the comboHash
				And compare it with the one provided
			*/
			const account = await methods.account.findByIdentification(req.body.identification);
			if (!account) {
				return next({code: 404, message: 'The username/email you entered, does not exist!'});
			}
			return res.status(200).send({
				account
			});
		} catch (error) {
			return next(error);
		}
	});

	router.get('/test/notImplemented', async (req, res, next) => {
		return next(new Error('This request is not implemented!'));
	});

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
