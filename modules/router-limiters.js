/*
	TODO Implement all the limiters
	This is a file that will provide all the rateLimiters
	For all the requests in the router
	The ones that can block how much a request can be used times
	Also block some abuses I guess...
 */

const rateLimiter = require('express-rate-limit');
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

const limitLogin = rateLimiter({
	store: new RedisStore({
		client
	}),
	windowMs: 1000 * 60 * 15,
	max: 3,
	message: 'Too much logins recently, try again later.',
	skipSuccessfulRequests: true
});

module.exports = {
	limitLogin
};
