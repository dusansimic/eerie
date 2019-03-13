module.exports = (Sequelize, DataTypes) => {
	const Account = Sequelize.import('./sequelizer-account');
	return Sequelize.define('IpBan', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		ip: {
			type: DataTypes.STRING,
			validate: {
				isIP: true
			}
		},
		admin: {
			type: DataTypes.STRING,
			references: {
				model: Account,
				key: 'id'
			}
		},
		reason: DataTypes.STRING,
		dateFrom: DataTypes.DATE,
		dateTo: DataTypes.DATE
	}, {
		timestamp: true
	});
};
