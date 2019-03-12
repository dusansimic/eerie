const bcrypt = require('bcryptjs');

module.exports = (Sequelize, DataTypes) => {
	return Sequelize.define('Account', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		username: DataTypes.STRING,
		password: {
			type: DataTypes.STRING,
			set(value) {
				this.setDataValue('password', bcrypt.hashSync(value, 10));
			}
		},
		email: {
			type: DataTypes.STRING,
			validate: {
				isEmail: true
			}
		},
		role: DataTypes.INTEGER,
		status: DataTypes.STRING
	}, {
		timestamps: true
	});
};
