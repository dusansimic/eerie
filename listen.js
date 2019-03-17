const port = 8000;

const routine = async function () {
	const server = await require('./eerie')();

	server.listen(port, () => {
		console.log('Server is running on ' + port + '.');
	});
};

routine();
