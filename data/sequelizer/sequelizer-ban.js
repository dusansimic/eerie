const methods = require('./sequelizer-method');

module.exports = (Sequelize, DataTypes) => {
	const Account = Sequelize.import('./sequelizer-account');
	return Sequelize.define('Ban', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			set(value) {
				this.setDataValue('id', value || methods.objectId());
			}
		},
		user: {
			type: DataTypes.STRING,
			references: {
				model: Account,
				key: 'id'
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
		timestamps: true
	});
};
