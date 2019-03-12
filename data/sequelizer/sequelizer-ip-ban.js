const Account = require('./sequelizer-account');

module.exports = (Sequelize, DataTypes) => {
	return Sequelize.define({
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
