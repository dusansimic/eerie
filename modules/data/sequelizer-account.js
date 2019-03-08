module.exports = (Sequelize, DataTypes) => {
	return Sequelize.define('Account', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		username: DataTypes.STRING,
		password: DataTypes.STRING,
		email: DataTypes.STRING
	}, {
		timestamps: true
	});
};
