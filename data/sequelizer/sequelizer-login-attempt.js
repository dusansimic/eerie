const Account = require('./sequelizer-account');

module.exports = (Sequelize, DataTypes) => {
	return Sequelize.define({
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
			}
		},
		success: {
			type: DataTypes.BOOLEAN
		}
	}, {
		timestamps: true
	});
};
