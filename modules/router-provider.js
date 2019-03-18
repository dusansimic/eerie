const express = require('express');

module.exports = async function (methods) {
	const router = express.Router();
	const logger = await require('./logger-provider')('authenticationRouter');

	router.get('/', async (req, res, next) => {
		return next(new Error('This request is not implemented!'));
	});

	router.use((err, req, res, next) => {
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

	return router;
};
