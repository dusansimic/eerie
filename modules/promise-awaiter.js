const awaitPromise = async promise => {
	return promise
		.then(data => [undefined, data])
		.catch(error => [error, undefined]);
};

module.exports = awaitPromise;
