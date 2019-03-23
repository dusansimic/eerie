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
const Redis = require('ioredis');

const env = require('./environment-variables');

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

let max = 3;
if (env.debug) {
	max = 10000000;
}

const limitLogin = rateLimiter({
	store: new RedisStore({
		client
	}),
	// Random max appeared!
	max,
	windowMs: 1000 * 60 * 15,
	message: 'Too much logins recently, try again later.',
	skipSuccessfulRequests: true
});

module.exports = {
	// Here I will list all the limiters
	limitLogin
};
