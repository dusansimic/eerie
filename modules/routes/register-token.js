module.exports = config => {

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
			if (config.roles.defaultValue && !req.account) {
				return next({code: 403, message: 'You are not logged in!'});
			}

			let role = null;
			let roles = null;

			if (req.account) {
				role = req.account.role;
				roles = config.options.rolesCreateRoles[role];

				if (!roles) {
					return next({code: 403, message: 'You are not permitted to create an account!'});
				}

				if (!roles.includes(req.body.role)) {
					return next({code: 403, message: 'You are not permitted to create an account with that role!'});
				}
			}

			return res.status(200).send({
				role,
				roles
			});
		} catch (error) {
			return next(error);
		}
	};
};
