module.exports = () => {
	return async (req, res, _) => {
		return res.status(200).send({
			id: req.account.id,
			account: {
				username: req.account.username,
				email: req.account.email,
				role: req.account.role,
				status: req.account.status,
				createdAt: req.account.createdAt,
				updatedAt: req.account.updatedAt
			}
		});
	};
};
