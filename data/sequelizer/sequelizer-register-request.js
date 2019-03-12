module.exports = (Sequelize, DataTypes) => {
	return Sequelize.define({
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		email: {
			type: DataTypes.STRING,
			validate: {
				isEmail: true
			}
		},
		dateCreation: DataTypes.DATE,
		dateExpiry: DataTypes.DATE,
		token: DataTypes.STRING
	}, {
		timestamps: true
	});
};
