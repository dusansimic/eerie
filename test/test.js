const request = require('supertest');
const express = require('express');

const eerie = require('../eerie');
const loggerProvider = require('../modules/logger-provider');
const env = require('../modules/environment-variables');

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
	port: env.redis.port ? env.redis.port : (env.redis.ssl ? 6380 : 6379),
	tls: env.redis.ssl
};

const nodemailerConfig = {
	service: env.nodemailer.service,
	host: env.nodemailer.host,
	port: env.nodemailer.port,
	username: env.nodemailer.username,
	password: env.nodemailer.password
};

const config = {
	debug: env.debug,
	secret: env.secret,
	application: express(),
	options: {
		time: {
			registerTokenTime: 120,
			passwordTokenTime: 30
		},
		roles: {
			// DefaultRole: 0,
			adminRoles: [1],
			rolesCreateRoles: {
				1: [0]
			},
		},
		// instantRegistration: false,
		loginAfterRegister: env.options.loginAfterRegister,
		passwordMethod: env.options.passwordMethod
	},
	sequelizeConfig,
	redisConfig,
	nodemailerConfig
};

const port = 1908;

let logger;
let instance;
let server;
let cookie;
let debugUser;

describe('debug server testing', function () {

	before('creating the server', async function () {
		logger = await loggerProvider('mochaTesting');
		instance = await eerie(config);

		debugUser = instance.application.debugUser;

		server = await instance.start();

		server.listen(port, () => {
			logger.debug('Test server is up on ' + port + '.');
		});
	});

	it('GET /me - first pass', function (done) {
		request(server)
			.get('/me')
			.set('Accept', 'application/json')
			.expect('Content-type', /json/)
			.expect(403)
			.end(function (err, res) {
				if (err) {
					logger.error(err.message);
					logger.trace(err);
					return done(err);
				}
				if (!res.headers['set-cookie']) {
					return done('Didn\'t receive a cookie!');
				}
				cookie = res.headers['set-cookie'][0].split(';')[0];
				logger.debug('Received a cookie!');
				logger.debug('Response message : ' + res.body.message);
				done();
			});
	});

	it('GET /me - taking cookie', function (done) {
		request(server)
			.get('/me')
			.set('Accept', 'application/json')
			.set('Cookie', cookie)
			.expect('Content-type', /json/)
			.expect(403)
			.end(function (err, res) {
				if (err) {
					logger.error(err.message);
					logger.trace(err);
					return done(err);
				}
				if (res.headers['set-cookie']) {
					return done('Received a cookie, where I should already have one!');
				}
				logger.debug('Didn\'t get a new cookie, which is good!');
				logger.debug('Response message : ' + res.body.message);
				done();
			});
	});

	it('POST /login - login as debug user', function (done) {
		request(server)
			.post('/login')
			.set('Cookie', cookie)
			.set('Accept', 'application/json')
			.send({
				identification: debugUser.id,
				password: debugUser.password
			})
			.expect('Content-type', /json/)
			.expect(200)
			.end(function (err, res) {
				if (err) {
					logger.error(err.message);
					logger.trace(err);
					return done(err);
				}
				logger.debug('Login response body : ');
				logger.debug(res.body);
				done();
			});
	});

	it('GET /me - third pass, debug user', function (done) {
		request(server)
			.get('/me')
			.set('Accept', 'application/json')
			.set('Cookie', cookie)
			.expect('Content-type', /json/)
			.expect(200)
			.end(function (err, res) {
				if (err) {
					logger.error(err.message);
					logger.trace(err);
					return done(err);
				}
				if (res.headers['set-cookie']) {
					return done('Received a cookie, where I should already have one!');
				}
				logger.debug('Didn\'t get a new cookie, which is good!');
				logger.debug('Response body : ');
				logger.debug(res.body);
				done();
			});
	});

	let token;

	describe('creating an account - creating a token', function () {
		it('POST /register/token - gathering a token', function (done) {
			request(server)
				.post('/register/token')
				.set('Accept', 'application/json')
				.set('Cookie', cookie)
				.send({
					'email': config.nodemailer.options.auth.user
				})
				.expect('Content-type', /json/)
				.expect(200)
				.end(function (err, res) {
					if (err) {
						logger.error(err.message);
						logger.trace(err);
						return done(err);
					}
					logger.debug('message : ' + res.body.message);
					done();
				});
		}).timeout(3000);

		after('get the token', async () => {
			let tokens = await server.methods.registerRequests.findAll();
			tokens.forEach(instance => {
				if (instance.email.indexOf('@ethereal.email') !== -1) {
					token = instance.token;
				}
			})
		});
	});

	describe('creating an account - creating the account', function () {
		it('POST /logout - logout to create the account', function (done) {
			request(server)
				.post('/logout')
				.set('Cookie', cookie)
				.set('Accept', 'application/json')
				.send({
					identification: debugUser.id,
					password: debugUser.password
				})
				.expect('Content-type', /json/)
				.expect(200)
				.end(function (err, res) {
					if (err) {
						logger.error(err.message);
						logger.trace(err);
						return done(err);
					}
					logger.debug('Logout response body : ');
					logger.debug(res.body);
					done();
				});
		});

		it('POST /register/valid - checking if the token is still fine', function (done) {
			request(server)
				.post('/register/valid')
				.set('Accept', 'application/json')
				.set('Cookie', cookie)
				.send({
					token
				})
				.expect('Content-type', /json/)
				.expect(200)
				.end(function (err, res) {
					if (err) {
						logger.error(err.message);
						logger.trace(err);
						return done(err);
					}
					if (res.headers['set-cookie']) {
						return done('Received a cookie, where I should already have one!');
					}
					logger.debug('message : ' + res.body.message);
					done();
				});
		});

		it('POST /register/final - creating the account', function (done) {
			request(server)
				.post('/register/final')
				.set('Accept', 'application/json')
				.set('Cookie', cookie)
				.send({
					token,
					username: debugUser.id,
					password: debugUser.password
				})
				.expect('Content-type', /json/)
				.expect(200)
				.end(function (err, res) {
					if (err) {
						logger.error(err.message);
						logger.trace(err);
						return done(err);
					}
					if (res.headers['set-cookie']) {
						return done('Received a cookie, where I should already have one!');
					}
					logger.debug('message : ' + res.body.message);
					done();
				});
		});

		after('delete users', async () => {
			const users = await server.methods.account.findAll();
			users.forEach(async user => {
				if (user.email.indexOf('@ethereal.email') !== -1) {
					await server.methods.account.delete(user);
				}
			});
		});

		after('delete tokens', async () => {
			const tokens = await server.methods.registerRequests.findAll();
			tokens.forEach(async token => {
				if (token.email.indexOf('@ethereal.email') !== -1) {
					await server.methods.registerRequests.delete(token);
				}
			});
		});
	});

	after('stop tests', () => {
		setTimeout(() => {
			process.exit(0);
		}, 2000);
	});
});
