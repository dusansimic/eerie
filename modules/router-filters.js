/*
	TODO Implement these filters actually
	These filters serve as additional 'middleware' for requests
	Serve to check if all the necessary data is in req.params/req.body/req.headers
	If not, to return the request right away
	Also block injections, I guess...
 */

const bodyContains = (body, fields) => {
	if (Object.keys(body).length !== fields.length) {
		return {code: 400, message: 'The body you sent is not properly formatted.'};
	}
	fields.forEach(key => {
		if (!body[key]) {
			return {code: 400, message: 'The body you sent is not properly formatted.'};
		}
	});
	return null;
};

const checkType = (value, type) => {
	if (typeof value !== type) {
		return {code: 400, message: 'One of the fields provided is not the proper type.'};
	}
	return null;
};

const filterLogin = (req, res, next) => {
	let bodyContaining = bodyContains(req.body, ['identification', 'password']);
	if (bodyContaining) {
		return next(bodyContaining);
	}
	let identificationString = checkType(req.body.identification, String);
	if (identificationString) {
		return next(identificationString);
	}
	let passwordString = checkType(req.body.password, String);
	if (passwordString) {
		return next(passwordString);
	}
	return next();
};

module.exports = {
	filterLogin
};
