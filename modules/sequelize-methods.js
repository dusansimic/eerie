const path = require('path');

const sequelize = require('./sequelize-init');

const {Op} = sequelize;
const modelsFolder = path.join(__dirname, '../data/sequelizer/');

const Accounts = sequelize.import(path.join(modelsFolder, 'sequelizer-account'));
const Bans = sequelize.import(path.join(modelsFolder, 'sequelizer-ban'));
const IpBans = sequelize.import(path.join(modelsFolder, 'sequelizer-ip-ban'));
const LoginAttempts = sequelize.import(path.join(modelsFolder, 'sequelizer-login-attempt'));
const PasswordRequests = sequelize.import(path.join(modelsFolder, 'sequelizer-password-request'));
const RegisterRequests = sequelize.import(path.join(modelsFolder, 'sequelizer-register-request'));

module.exports = {
	_extra: {
		sequelize
	},
	account: {
		findAll: async () => await Accounts.findAll({raw: true}),
		findById: async id => await Accounts.findOne({
			where: {id},
			raw: true
		}),
		findByIdentification: async identification => await Accounts.findOne({
			where: {[Op.or]: [{username: identification}, {email: identification}]}
		}),
		create: async account => await Accounts.create(account)
	},
	bans: {
		findAll: async () => await Bans.findAll({raw: true}),
		findByUser: async id => await Bans.findAll({
			where: {user: id},
			order: ['createdAt', 'DESC']
		}),
		create: async ban => await Bans.create(ban)
	},
	ipBans: {
		findAll: async () => await IpBans.findAll({raw: true}),
		findByIp: async ip => await IpBans.findOne({
			where: {ip},
			order: ['createdAt', 'DESC']
		}),
		create: async ipBan => await IpBans.create(ipBan)
	},
	loginAttempts: {
		findAll: async () => await LoginAttempts.findAll({raw: true}),
		findByUser: async id => await LoginAttempts.findAll({
			where: {user: id},
			order: ['createdAt', 'DESC']
		}),
		create: async loginAttempt => await LoginAttempts.create(loginAttempt)
	},
	passwordRequests: {
		findAll: async () => await PasswordRequests.findAll({raw: true}),
		findByUser: async id => await PasswordRequests.findAll({
			where: {user: id},
			order: ['createdAt', 'DESC']
		}),
		create: async passwordRequest => await PasswordRequests.create(passwordRequest)
	},
	registerRequests: {
		findAll: async () => await RegisterRequests.findAll({raw: true}),
		findByEmail: async email => await RegisterRequests.findAll({
			where: {email},
			order: ['createdAt', 'DESC']
		}),
		findByIp: async ip => await RegisterRequests.findAll({
			where: {ip},
			order: ['createdAt', 'DESC']
		}),
		create: async registerRequest => await RegisterRequests.create(registerRequest)
	}
};
