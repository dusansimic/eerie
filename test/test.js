const Sequelize = require('sequelize');
const Redis = require('ioredis');
const request = require('supertest');

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

const config = {
	debug: env.debug,
	secret: env.secret,
	options: {
		roles: {
			// DefaultRole: 0,
			adminRoles: [1],
			rolesCreateRoles: {
				1: [0]
			},
		},
		loginAfterRegister: env.options.loginAfterRegister,
		passwordMethod: env.options.passwordMethod
	},
	sequelize,
	redis
};

const port = 1908;

let logger;
let server;
let cookie;
let debugUser;

describe('server testing', function () {

	before('creating the server', async function () {
		logger = await loggerProvider('mochaTesting');
		server = await eerie(config);

		debugUser = server.debugUser;

		server.listen(port, () => {
			logger.debug('Test server is up on ' + port + '.');
		});
	});

	it('should just get GET /me', function (done) {
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

	it('we can try to get it again, but now we have a cookie GET /me', function (done) {
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

	it('now we attempt to login, and see what happens POST /login', function (done) {
		logger.debug(debugUser);
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

	it('now since we\'re logged in, we\'ll GET /me', function (done) {
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

	after('stop tests', () => {
		setTimeout(() => {
			process.exit(0);
		}, 2000);
	});
});
