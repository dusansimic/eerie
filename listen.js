const Sequelize = require('sequelize');
const Redis = require('ioredis');

// Const IpBan = require('./data/ip-ban');

const eerie = require('./eerie');
const env = require('./modules/environment-variables');

const port = 8000;

const routine = async function () {
	/*
		This is how you initialize the library, with some options, debug switch
		And the sequelize/mongoose connection, and redis connection
	 */
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

	const server = await eerie({
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

	const logger = await require('./modules/logger-provider')('serverStarter');
	server.listen(port, () => {
		logger.info('Server is running on ' + port + '.');
	});

	/*
		Const ipBan = {
			ip: '188.2.39.182',
			admin: '5c97a28549149030295ca54e',
			reason: 'testing',
			dateFrom: new Date(),
			dateTo: new Date(2019, 4, 1)
		};
		server.methods.ipBans.create(IpBan.createFromObject(ipBan));
	 */
};

routine()
	.then(() => {
		console.log('Application started.');
	});
