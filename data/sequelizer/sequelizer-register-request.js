const methods = require('./sequelizer-method');

module.exports = (Sequelize, DataTypes) => {
	return Sequelize.define('RegisterRequest', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			set(value) {
				this.setDataValue('id', value || methods.objectId());
			}
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
