module.exports = (methods, config) => {
	return async (req, res, next) => {
		try {
			/*
				If the option to login after register is enabled
				Need to check if it is logged in
			 */

			if (config.options.instantRegistration) {
				return next({code: 401, message: 'Instant Registration is on, no tokens.'});
			}

			if (config.options.loginAfterRegister) {
				if (req.session.token) {
					return next({code: 401, message: 'You are already logged in!'});
				}
			}

			const request = await methods.registerRequests.findByToken(req.body.token);
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

			// If (config.options.loginAfterRegister) {
			// 	req.session.token = {
			// 		id: account.id,
			// 		password: account.password
			// 	};
			// }

			return res.status(200).send({
				message: 'The token is valid!'
			});
		} catch (error) {
			return next(error);
		}
	};
};
