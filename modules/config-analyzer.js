module.exports = async config => {
	const logger = await require('./logger-provider')('configAnalyzer');
	const passwordMethods = ['SHA256', 'bcrypt'];

	if (typeof config.debug !== 'boolean') {
		throw new TypeError('config.debug must be boolean type');
	}

	if (typeof config.secret !== 'string') {
		throw new TypeError('config.secret must be string type');
	}

	if (typeof config.options !== 'object') {
		throw new TypeError('config.options must be object type');
	}

	if (typeof config.options.loginAfterRegister !== 'boolean') {
		throw new TypeError('config.options.loginAfterRegister must be boolean type');
	}

	if (!passwordMethods.includes(config.options.passwordMethod)) {
		throw new Error('config.options.passwordMethod is not in ' + passwordMethods);
	}

	/*
		TODO Analyze the rolesCreateRoles part
	 */
	if (typeof config.options.rolesCreateRoles !== 'object') {
		throw new TypeError('config.options.rolesCreateRoles must be object type');
	}

	switch (config.options.passwordMethod) {
		case 'SHA256':
		case 'bcrypt':
			logger.debug('The method for passwords is ' + config.options.passwordMethod);
			break;
		default:
			throw new Error('You haven\'t specified a password hashing method!');
	}
};
