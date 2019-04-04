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

			const request = await methods.registerRequests.findByToken(req.body.token);
			if (!request) {
				return next({code: 404, message: 'The token you provided does not exist!'});
			}

			// If (config.options.loginAfterRegister) {
			// 	req.session.token = {
			// 		id: account.id,
			// 		password: account.password
			// 	};
			// }

			return res.status(200).send({
				request
			});
		} catch (error) {
			return next(error);
		}
	};
};
