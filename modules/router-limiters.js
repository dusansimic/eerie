/*
	TODO Implement all the limiters
	This is a file that will provide all the rateLimiters
	For all the requests in the router
	The ones that can block how much a request can be used times
	Also block some abuses I guess...
 */

const rateLimiter = require('express-rate-limit');

/*
	This miracle of work is using Redis for cache storage
	So I also setup the Redis connection here
 */

const RedisStore = require('rate-limit-redis');

module.exports = async config => {
	const windowMs = config.debug ? 1 : 1000 * 60 * 15;
	const max = config.debug ? 100000000 : 3;

	const limitLogin = rateLimiter({
		store: new RedisStore({
			client: config.redis
		}),
		// Random max appeared!
		max,
		windowMs,
		message: 'Too much login requests recently, try again later.',
		skipSuccessfulRequests: true
	});

	const limitRegister = rateLimiter({
		store: new RedisStore({
			client: config.redis
		}),
		max,
		windowMs,
		message: 'Too much register requests recently, try again later.',
		skipSuccessfulRequests: true
	});

	// Here I will list all the limiters
	return {
		limitLogin,
		limitRegister
	};
};
