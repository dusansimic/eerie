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
		role: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		ip: {
			type: DataTypes.STRING,
			validate: {
				isIP: true
			}
		},
		used: {
			type: DataTypes.BOOLEAN,
			default: false
		},
		dateCreation: DataTypes.DATE,
		dateExpiry: DataTypes.DATE,
		dateLastSent: DataTypes.DATE,
		token: DataTypes.STRING(500) // eslint-disable-line new-cap
	}, {
		timestamps: true
	});
};
