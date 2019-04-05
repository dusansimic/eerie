const Sequelize = require('sequelize');
const Redis = require('ioredis');
const nodemailer = require('nodemailer');

const eerie = require('./eerie');
const env = require('./modules/environment-variables');

const port = 8000;

const routine = async function () {
	const logger = await require('./modules/logger-provider')('serverStarter');

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

	const transporterConfig = {
		auth: {
			user: env.nodemailer.username,
			pass: env.nodemailer.password
		}
	};

	if (env.nodemailer.service === 'gmail') {
		transporterConfig.service = env.nodemailer.service;
	} else if (env.nodemailer.service === 'ethereal') {
		const testData = await nodemailer.createTestAccount();
		transporterConfig.host = testData.smtp.host;
		transporterConfig.port = testData.smtp.port;
		transporterConfig.auth = {
			user: testData.user,
			pass: testData.pass
		};
	} else {
		transporterConfig.host = env.nodemailer.host;
		transporterConfig.port = env.nodemailer.port;
	}

	logger.debug(transporterConfig.auth);

	const transporter = nodemailer.createTestAccount(transporterConfig);

	const server = await eerie({
		debug: env.debug,
		secret: env.secret,
		options: {
			roles: {
				// DefaultRole: 0,
				adminRoles: [1],
				rolesCreateRoles: {
					1: [0]
				}
			},
			loginAfterRegister: env.options.loginAfterRegister,
			passwordMethod: env.options.passwordMethod
		},
		sequelize,
		redis,
		transporter
	});

	server.listen(port, () => {
		logger.info('Server is running on ' + port + '.');
	});
};

routine()
	.then(() => {
		console.log('Application started.');
	});
