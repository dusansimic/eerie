const awaitPromise = async promise => {
	return await promise
		.then(data => [undefined, data])
		.catch(err => [err, undefined]);
};

module.exports = awaitPromise;