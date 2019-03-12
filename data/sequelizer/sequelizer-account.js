const bcrypt = require('bcryptjs');

module.exports = (Sequelize, DataTypes) => {
	return Sequelize.define('Account', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		username: DataTypes.STRING,
		email: {
			type: DataTypes.STRING,
			validate: {
				isEmail: true
			}
		},
		password: {
			type: DataTypes.STRING,
			set(value) {
				this.setDataValue('password', bcrypt.hashSync(value, 10));
			}
		},
		role: DataTypes.INTEGER,
		status: DataTypes.STRING
	}, {
		timestamps: true
	});
};
