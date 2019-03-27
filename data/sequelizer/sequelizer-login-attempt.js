const methods = require('./sequelizer-method');

module.exports = (Sequelize, DataTypes) => {
	const Account = Sequelize.import('./sequelizer-account');
	return Sequelize.define('LoginAttempt', {
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
			},
			allowNull: true
		},
		ip: {
			type: DataTypes.STRING,
			validate: {
				isIP: true
			},
			defaultValue: '127.0.0.1'
		},
		success: {
			type: DataTypes.BOOLEAN
		}
	}, {
		timestamps: true
	});
};
