const express = require('express');

const filters = require('./router-filters');
const limiters = require('./router-limiters');

module.exports = async function (methods) {
	const router = express.Router(); // eslint-disable-line new-cap
	const logger = await require('./logger-provider')('authenticationRouter');

	router.post('/login', limiters.limitLogin, filters.filterLogin, async (req, res, next) => {
		try {
			/*
				Need to filter out req.body
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
