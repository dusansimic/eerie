const port = 8000;

const routine = async function () {
	const server = await require('./eerie')();
	const logger = await require('./modules/logger-provider')('Server starter');

	server.listen(port, () => {
		logger.info('Server is running on ' + port + '.');
	});
};

routine();
