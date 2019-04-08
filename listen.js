const eerie = require('./eerie');
const env = require('./modules/environment-variables');

const port = 8000;

const routine = async function () {
	const logger = await require('./modules/logger-provider')('serverStarter');

	/*
		This is how you initialize the library, with some options, debug switch
		And the sequelize/mongoose connection, and redis connection
	 */
	const sequelizeConfig = {
		host: env.sequelize.host,
		username: env.sequelize.authenticationData.username,
		password: env.sequelize.authenticationData.password,
		dialect: env.sequelize.databaseType,
		database: env.sequelize.initial,
		dialectOptions: {
			encrypt: env.sequelize.encrypt
		}
	};

	const redisConfig = {
		host: env.redis.host,
		password: env.redis.password,
		port: env.redis.ssl ? 6380 : 6379,
		tls: env.redis.ssl
	};

	const nodemailerConfig = {
		service: env.nodemailer.service,
		host: env.nodemailer.host,
		port: env.nodemailer.port,
		username: env.nodemailer.username,
		password: env.nodemailer.password
	};

	const server = await eerie({
		debug: env.debug,
		secret: env.secret,
		options: {
			time: {
				registerTokenTime: 120,
				registerRepeatTime: 2,
				passwordTokenTime: 30,
				passwordRepeatTime: 2
			},
			roles: {
				// DefaultRole: 0,
				adminRoles: [1],
				rolesCreateRoles: {
					1: [0]
				}
			},
			instantRegistration: true,
			loginAfterRegister: env.options.loginAfterRegister,
			passwordMethod: env.options.passwordMethod
		},
		sequelizeConfig,
		redisConfig,
		nodemailerConfig
	});

	server.listen(port, () => {
		logger.info('Server is running on ' + port + '.');
	});
};

routine()
	.then(() => {
		console.log('Application started.');
	});
