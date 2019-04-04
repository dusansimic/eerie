module.exports = () => {
	return async (req, res, _) => {
		delete req.session.token;
		return res.status(200).send({
			message: 'You have successfully logged out!'
		});
	};
};
