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
		dateCreation: DataTypes.DATE,
		dateExpiry: DataTypes.DATE,
		token: DataTypes.STRING
	}, {
		timestamps: true
	});
};
