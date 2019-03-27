const Sequelize = require('sequelize');
const Redis = require('ioredis');

const eerie = require('../eerie');
const loggerProvider = require('../modules/logger-provider');
const env = require('../modules/environment-variables');

const sequelize = new Sequelize({
	host: env.sequelize.host,
	username: env.sequelize.authenticationData.username,
	password: env.sequelize.authenticationData.password,
	dialect: env.sequelize.databaseType,
	database: env.sequelize.initial,
	dialectOptions: {
		encrypt: env.sequelize.encrypt
	}
});

const redis = new Redis({
	host: env.redis.host,
	password: env.redis.password,
	port: env.redis.ssl ? 6380 : 6379,
	tls: env.redis.ssl
});

const port = 1908;

let logger;
let server;

describe('server testing', function () {

	before('creating the server', async function () {
		logger = await loggerProvider('Testing');
		logger.debug('Before HELLO!');

		server = await eerie({
			debug: env.debug,
			secret: env.secret,
			options: {
				rolesCreateRoles: {
					1: [0],
					666: [1, 0]
				},
				loginAfterRegister: env.options.loginAfterRegister,
				passwordMethod: env.options.passwordMethod
			},
			sequelize,
			redis
		});
		server.listen(port, () => {
			logger.debug('Test server is up on ' + port + '.');
		});
	});

	it('should say hello', function (done) {
		logger.info('HELLO!');
		done();
	});
});
