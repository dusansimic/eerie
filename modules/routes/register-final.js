const jwt = require('jsonwebtoken');
const Account = require('../../data/account');

module.exports = (methods, config) => {
	return async (req, res, next) => {
		try {
			/*
				If the option to login after register is enabled
				Need to check if it is logged in
			 */

			if (config.options.loginAfterRegister) {
				if (req.session.token) {
					return next({code: 401, message: 'You are already logged in!'});
				}
			}

			const account = {};
			let request = null;

			if (config.options.instantRegistration) {
				account.username = req.body.username;
				account.password = req.body.password;
				if (!(config.options.roles.defaultValue || config.options.roles.defaultValue === 0)) {
					throw new Error('You did not set a defaultValue, which has to be set if instantRegistration is true.');
				}

				account.role = config.options.roles.defaultValue;
			} else {
				request = await methods.registerRequests.findByToken(req.body.token);
				if (!request) {
					return next({code: 404, message: 'The token you provided does not exist!'});
				}

				const now = new Date();
				if (request.used) {
					return next({code: 401, message: 'The token has been used!'});
				}

				if (!(request.dateCreation < now && now < request.dateExpiry)) {
					return next({code: 401, message: 'The token has expired!'});
				}

				const data = jwt.verify(req.body.token, config.secret);
				account.email = data.email;
				account.role = data.role;
				account.username = req.body.username;
				account.password = req.body.password;
			}

			const result = await methods.account.create(Account.createFromObject(account));

			if (!config.options.instantRegistration) {
				request.used = true;
				await request.save();
			}

			return res.status(200).send({
				message: 'Successfully registered ' + result.username + '.'
			});
		} catch (error) {
			if (typeof error.code === 'string') {
				error.code = 500;
			}

			return next(error);
		}
	};
};
