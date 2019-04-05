const HttpError = require('../http-error');

module.exports = (methods, config) => {
	/*
		Config map
		roles: {
			defaultRole,
			adminRoles,
			rolesCreateRoles
		}
		'DefaultRole' is the role set when an account is created by non-logged-in user
		*IMPORTANT* if there is no defaultRole, non-logged-in users can't create accounts
		'AdminRoles' are just roles that will have access to admin functions
		Will default to [666] if nothing gets set
		'RolesCreateRoles' only serves for logged-in users registering new accounts
	 */

	return async (req, res, next) => {
		try {
			/*
				The config has data, on which roles can create tokens at all.
				And on which roles can create which roles.
				Check right away, if non-logged-in users are at all able to create accounts.
			 */

			const data = {};

			console.log(req.account);
			console.log(config.options.roles);

			if (req.account) {
				if (config.isDebugUser(req.account.id, req.account.password)) {
					data.role = req.body.role || 0;
				} else {
					const {role} = req.account;
					const roles = config.options.roles.rolesCreateRoles[role];

					if (!roles) {
						return next({code: 403, message: 'You are not permitted to create an account!'});
					}

					if (!roles.includes(req.body.role)) {
						return next({code: 403, message: 'You are not permitted to create an account with that role!'});
					}

					data.role = req.body.role;
				}
			} else {
				if (!config.options.roles.defaultRole) {
					throw new HttpError('Non-logged in users can\'t create accounts!', 400);
				}

				data.role = config.options.roles.defaultRole;
			}

			console.log(config.transporter);

			return res.status(200).send({
				data
			});
		} catch (error) {
			return next(error);
		}
	};
};
