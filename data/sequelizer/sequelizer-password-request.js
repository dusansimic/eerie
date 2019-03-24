const methods = require('./sequelizer-method');

module.exports = (Sequelize, DataTypes) => {
	const Account = Sequelize.import('./sequelizer-account');
	return Sequelize.define('PasswordRequest', {
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
		ip: {
			type: DataTypes.STRING,
			validate: {
				isIP: true
			},
			defaultValue: '127.0.0.1'
		},
		dateCreation: DataTypes.DATE,
		dateExpiry: DataTypes.DATE,
		token: DataTypes.STRING
	}, {
		timestamps: true
	});
};
