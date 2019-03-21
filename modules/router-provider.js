const express = require('express');
const rateLimiter = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const Chance = require('chance');

const filters = require('./router-filters');
const env = require('./environment-variables');

module.exports = async function (methods) {
	const router = express.Router(); // eslint-disable-line new-cap
	const logger = await require('./logger-provider')('authenticationRouter');
	const chance = new Chance();

	const redisConfig = {
		host: env.redis.host,
		password: env.redis.password
	};

	if (env.redis.ssl) {
		redisConfig.tls = true;
		redisConfig.port = 6380;
	} else {
		redisConfig.port = 6379;
	}

	const client = new Redis(redisConfig);

	// Instance keyword, want to have some first name, just to see some nice names
	const instanceKeyword = chance.first({gender: 'female'});
	logger.debug('Instance Keyword: ' + instanceKeyword);

	const loginLimiter = rateLimiter({
		store: new RedisStore({
			client
		}),
		windowMs: 1000 * 60 * 15,
		max: 3,
		message: 'Too much logins recently, try again later.',
		skipSuccessfulRequests: true
	});

	router.post('/login', loginLimiter, filters.filterLogin, async (req, res, next) => {
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
