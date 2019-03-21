const filterLogin = (req, res, next) => {
	console.log(JSON.stringify(req) + JSON.stringify(res) + JSON.stringify(next));
};

module.exports = {
	filterLogin
};
