module.exports = (Sequelize, DataTypes) => {
	const Account = Sequelize.import('./sequelizer-account');
	return Sequelize.define('Requests', {
		ip: {
			type: DataTypes.STRING,
			validate: {
				isIP: true
			},
			primaryKey: true,
			defaultValue: '127.0.0.1'
		},
		requestPath: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		date: {
			type: DataTypes.DATE,
			primaryKey: true,
			defaultValue: DataTypes.NOW
		},
		accountId: {
			type: DataTypes.STRING,
			references: {
				model: Account,
				key: 'id'
			},
			allowNull: true
		},
		statusCode: DataTypes.INTEGER
	}, {
		timestamps: true
	});
};
