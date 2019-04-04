module.exports = () => {
	return async (req, res, _) => {
		return res.status(200).send({
			account: req.account
		});
	};
};
