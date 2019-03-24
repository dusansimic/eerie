const Sequelize = require('sequelize');
const Redis = require('ioredis');

const env = require('./modules/environment-variables');

const port = 8000;

const routine = async function () {
	/*
		This is how you initialize the library, with some options, debug switch
		And the sequelize/mongoose connection, and redis connection
	 */
	const server = await require('./eerie')({
		debug: Boolean(env.debug),
		secret: env.secret,
		options: {
			rolesCreateRoles: {
				0: [0, 1],
				1: [0]
			},
			loginAfterRegister: Boolean(env.options.loginAfterRegister),
			passwordMethod: env.options.passwordMethod
		},
		sequelize: new Sequelize({
			host: env.sequelize.host,
			username: env.sequelize.authenticationData.username,
			password: env.sequelize.authenticationData.password,
			dialect: env.sequelize.databaseType,
			database: env.sequelize.initial,
			dialectOptions: {
				encrypt: Boolean(env.sequelize.encrypt)
			}
		}),
		redis: new Redis({
			host: env.redis.host,
			password: env.redis.password,
			port: env.redis.ssl ? 6380 : 6379,
			tls: Boolean(env.redis.ssl)
		})
	});

	const logger = await require('./modules/logger-provider')('serverStarter');
	server.listen(port, () => {
		logger.info('Server is running on ' + port + '.');
	});
};

routine();
