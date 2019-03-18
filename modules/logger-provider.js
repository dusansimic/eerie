const log4js = require('log4js');
const moment = require('moment');

module.exports = async function (name) {
	const appenders = {
		console: {type: 'console'},
		file: {type: 'file', filename: ('logs/log-' + (moment().format('MM-DD-YYYY_HH:MM') + '.log'))}
	};

	const categories = {
		default: {appenders: ['console', 'file'], level: 'ALL'},
		[name]: {appenders: ['console', 'file'], level: 'ALL'}
	};

	return log4js.configure({
		appenders,
		categories
	}).getLogger(name);
};
