const methods = require('./sequelizer-method');

module.exports = (Sequelize, DataTypes) => {
	const Account = Sequelize.import('./sequelizer-account');
	return Sequelize.define('IpBan', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			set(value) {
				this.setDataValue('id', value || methods.objectId());
			}
		},
		ip: {
			type: DataTypes.STRING,
			validate: {
				isIP: true
			},
			defaultValue: '127.0.0.1'
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
