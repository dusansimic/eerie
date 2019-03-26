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

	const createConfig = message => {
		return {
			store: new RedisStore({
				client: config.redis
			}),
			max,
			windowMs,
			message,
			skipSuccessfulRequests: true
		};
	};

	const limitLogin = rateLimiter(createConfig('Too much login requests recently, try again later.'));
	const limitRegisterTokenCreate = rateLimiter(createConfig('Too much register token create requests recently, try again later.'));
	const limitRegisterTokenCheck = rateLimiter(createConfig('Too much register token check requests recently, try again later.'));
	const limitRegisterFinish = rateLimiter(createConfig('Too much register finish requests recently, try again later.'));

	// Here I will list all the limiters
	return {
		limitLogin,
		limitRegisterTokenCreate,
		limitRegisterTokenCheck,
		limitRegisterFinish
	};
};
