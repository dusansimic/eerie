const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const LoginAttempt = require('../../data/login-attempt');

module.exports = (methods, config) => {
	return async (req, res, next) => {
		try {
			/*
				If the user is logged in
			 */
			if (req.session.token) {
				return next({code: 401, message: 'You are already logged in!'});
			}

			const loginAttempt = {
				ip: req.ip
			};

			/*
				Debug mode login
				Made for testing
			 */
			if (config.debug && (req.body.identification === config.debugUser.id && req.body.password === config.debugUser.password)) {
				req.session.token = {
					id: config.debugUser.id,
					password: config.debugUser.password
				};
				/*
					If there appears to be a null/true loginAttempt
					That means someone logged in as a debug user.
				 */
				loginAttempt.user = null;
				loginAttempt.success = true;
				await methods.loginAttempts.create(LoginAttempt.createFromObject(loginAttempt));
				return res.status(200).send({
					account: config.debugUser,
					message: 'Logged in as debug user.'
				});
			}

			/*
				Check provided identification
				And then, if it exists, calculate the comboHash
				And compare it with the one provided
			*/
			const account = await methods.account.findByIdentification(req.body.identification);
			if (!account) {
				/*
					If there appears to be a null/false loginAttempt
					That means someone tried to login as a non existing user.
				 */
				loginAttempt.user = null;
				loginAttempt.success = false;
				await methods.loginAttempts.create(LoginAttempt.createFromObject(loginAttempt));
				return next({code: 404, message: 'The username/email you entered, does not exist!'});
			}

			if (config.options.passwordMethod === 'SHA256') {
				if (!(req.body.password === account.password ||
					(crypto.createHash('sha256').update(req.body.password, 'utf8').digest('hex') === account.password))) {
					/*
						If there appears to be a id/false loginAttempt
						That means someone tried to login, but entered a wrong password.
					 */
					loginAttempt.user = account.id;
					loginAttempt.success = false;
					await methods.loginAttempts.create(LoginAttempt.createFromObject(loginAttempt));
					return next({code: 400, message: 'The password you entered, is not correct!'});
				}
			} else if (config.options.passwordMethod === 'bcrypt') {
				if (!bcrypt.compareSync(req.body.password, account.password)) {
					loginAttempt.user = account.id;
					loginAttempt.success = false;
					await methods.loginAttempts.create(LoginAttempt.createFromObject(loginAttempt));
					return next({code: 400, message: 'The password you entered, is not correct!'});
				}
			}

			/*
				Account can't be banned and let you to login
			 */
			const ban = await methods.bans.findByUser(account.id);
			if (ban) {
				const json = ban.dataValues;
				const now = new Date();

				if (json.dateFrom.getTime() <= now.getTime() && json.dateTo.getTime() >= now.getTime()) {
					if (req.session.token) {
						delete req.session.token;
					}

					loginAttempt.user = account.id;
					loginAttempt.success = false;
					await methods.loginAttempts.create(LoginAttempt.createFromObject(loginAttempt));
					return next({code: 403, message: 'Your account was banned.', ban: {
						reason: json.reason,
						dateFrom: json.dateFrom,
						dateTo: json.dateTo
					}});
				}
			}

			req.session.token = {
				id: account.id,
				password: account.password
			};

			/*
				If there appears to be a id/true loginAttempt
				That means someone tried to login and did so.
			 */
			loginAttempt.user = account.id;
			loginAttempt.success = true;
			await methods.loginAttempts.create(LoginAttempt.createFromObject(loginAttempt));

			return res.status(200).send({
				account: req.session.token
			});
		} catch (error) {
			return next(error);
		}
	};
};
