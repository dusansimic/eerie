const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const env = require('../../modules/environment-variables');
const methods = require('./sequelizer-method');

// This is pretty much the type Account, adapted for Sequelize
module.exports = (Sequelize, DataTypes) => {
	let hashFunction;
	let hashing;

	switch (env.options.passwordMethod) {
		case 'bcrypt':
			hashFunction = value => {
				return bcrypt.hashSync(value, 10);
			};

			break;
		case 'SHA256':
			hashing = crypto.createHash('sha256');
			hashFunction = value => {
				return hashing.update(value, 'utf8').digest('hex');
			};

			break;
		default:
			throw new Error('You haven\'t specified a password hashing method!');
	}

	return Sequelize.define('Account', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			set(value) {
				this.setDataValue('id', value || methods.objectId());
			}
		},
		username: {
			type: DataTypes.STRING,
			validate: {
				isAlphanumeric: true
			}
		},
		email: {
			type: DataTypes.STRING,
			validate: {
				isEmail: true
			},
			allowNull: true
		},
		password: {
			type: DataTypes.STRING,
			set(value) {
				this.setDataValue('password', hashFunction(value));
			}
		},
		role: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		status: {
			type: DataTypes.STRING,
			defaultValue: ''
		}
	}, {
		timestamps: true
	});
};
