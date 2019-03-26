const loggerProvider = require('../modules/logger-provider');

describe('console.log test', function () {

	let logger;

	loggerProvider('Testing')
		.then(obj => {
			logger = obj;
		});

	it('should say hello', function () {
		logger.info('HELLO!');
	});
});
