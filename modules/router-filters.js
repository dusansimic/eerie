/*
	TODO Implement these filters actually
	These filters serve as additional 'middleware' for requests
	Serve to check if all the necessary data is in req.params/req.body/req.headers
	If not, to return the request right away
	Also block injections, I guess...
 */

const HttpError = require('./http-error');

// This is a general function, should be used in all/alot of the filters
const bodyContains = (body, fields, strict = true) => {
	if (strict && Object.keys(body).length !== fields.length) {
		throw new HttpError('The body you sent is not properly formatted.', 400);
	}

	const hasKeys = fields.filter(key => Object.prototype.hasOwnProperty.call(body, key));
	if (hasKeys.length !== fields.length) {
		throw new HttpError('The body you sent is not properly formatted.', 400);
	}
};

// This is a function that will be used always, to check if the field is the proper type
const checkType = (value, type) => {
	if (typeof value !== type) {
		throw new HttpError('One of the fields provided is not the proper type.', 400);
	}
};

const regex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/;

const email = value => {
	if (!regex.test(value)) {
		throw new HttpError('You didn\'t provide an email address.', 400);
	}
};

const filterLogin = (req, res, next) => {
	try {
		bodyContains(req.body, ['identification', 'password']);
		checkType(req.body.identification, 'string');
		checkType(req.body.password, 'string');
		return next();
	} catch (error) {
		return next(error);
	}
};

const filterRegisterTokenCreate = (req, res, next) => {
	try {
		bodyContains(req.body, ['email'], false);
		email(req.body.email);
		checkType(req.body.email, 'string');
		return next();
	} catch (error) {
		return next(error);
	}
};

const filterRegisterTokenCheck = (req, res, next) => {
	try {
		bodyContains(req.body, ['token'], false);
		checkType(req.body.token, 'string');
		return next();
	} catch (error) {
		return next(error);
	}
};

const filterRegisterFinish = (req, res, next) => {
	try {
		bodyContains(req.body, ['username', 'password'], false);
		checkType(req.body.username, 'string');
		checkType(req.body.password, 'string');
		return next();
	} catch (error) {
		return next(error);
	}
};

module.exports = {
	// Here I will list all the filters
	filterLogin,
	filterRegisterTokenCreate,
	filterRegisterTokenCheck,
	filterRegisterFinish
};
