const express = require('express');
const Chance = require('chance');

module.exports = async function (methods) {
	const router = express.Router(); // eslint-disable-line new-cap
	const logger = await require('./logger-provider')('authenticationRouter');
	const chance = new Chance();
	// Instance keyword, want to have some first name, and someday maybe get a really good one
	const instanceKeyword = chance.first({gender: 'female'});
	logger.debug('Instance Keyword: ' + instanceKeyword);

	router.get('/', async (req, res, next) => {
		try {
			const data = methods.account.findAll();
			return res.status(200).send({
				accounts: data
			});
		} catch (error) {
			return next(error);
		}
	});

	router.get('/test/notImplemented', async (req, res, next) => {
		return next(new Error('This request is not implemented!'));
	});

	router.use((error, req, res, next) => {
		if (next) {
			next();
		}

		logger.error('|ERROR| -> ' + error.message);
		logger.trace(error);
		return res.status(error.code || 500).send({
			message: error.message || 'Unexpected error occured.',
			error: error
		});
	});

	return router;
};
