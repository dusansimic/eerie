module.exports = (Sequelize, DataTypes) => {
	const Account = Sequelize.import('./sequelizer-account');
	return Sequelize.define('PasswordRequest', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true
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
