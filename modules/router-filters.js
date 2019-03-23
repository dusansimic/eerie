/*
	TODO Implement these filters actually
	These filters serve as additional 'middleware' for requests
	Serve to check if all the necessary data is in req.params/req.body/req.headers
	If not, to return the request right away
	Also block injections, I guess...
 */

// This is a general function, should be used in all/alot of the filters
const bodyContains = (body, fields, next) => {
	if (Object.keys(body).length !== fields.length) {
		return next({code: 400, message: 'The body you sent is not properly formatted.'});
	}
	fields.forEach(key => {
		if (!body[key]) {
			return next({code: 400, message: 'The body you sent is not properly formatted.'});
		}
	});
};

// This is a function that will be used always, to check if the field is the proper type
const checkType = (value, type, next) => {
	if (typeof value !== type) {
		return next({code: 400, message: 'One of the fields provided is not the proper type.'});
	}
};

const filterLogin = (req, res, next) => {
	bodyContains(req.body, ['identification', 'password'], next);
	checkType(req.body.identification, 'string', next);
	checkType(req.body.password, 'string', next);
	return next();
};

module.exports = {
	// Here I will list all the filters
	filterLogin
};
