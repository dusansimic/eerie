const path = require('path');

module.exports = async function (sequelize) {
	const {Op} = sequelize;

	const modelsFolder = path.join(__dirname, '../data/sequelizer/');
	const Accounts = sequelize.import(path.join(modelsFolder, 'sequelizer-account'));
	const Bans = sequelize.import(path.join(modelsFolder, 'sequelizer-ban'));
	const IpBans = sequelize.import(path.join(modelsFolder, 'sequelizer-ip-ban'));
	const LoginAttempts = sequelize.import(path.join(modelsFolder, 'sequelizer-login-attempt'));
	const PasswordRequests = sequelize.import(path.join(modelsFolder, 'sequelizer-password-request'));
	const RegisterRequests = sequelize.import(path.join(modelsFolder, 'sequelizer-register-request'));
	const Requests = sequelize.import(path.join(modelsFolder, 'sequelizer-requests'));

	sequelize.sync();

	return {
		account: {
			findAll: async () => await Accounts.findAll(),
			findById: async id => await Accounts.findOne({
				where: {id}
			}),
			findByIdentification: async identification => await Accounts.findOne({
				where: {[Op.or]: [{username: identification}, {email: identification}]}
			}),
			create: async account => await Accounts.create(account),
			delete: async account => {
				return await account.destroy();
			}
		},
		bans: {
			findAll: async () => await Bans.findAll(),
			findByUser: async id => await Bans.findOne({
				where: {user: id},
				order: [['createdAt', 'DESC']]
			}),
			create: async ban => await Bans.create(ban)
		},
		ipBans: {
			findAll: async () => await IpBans.findAll(),
			findByIp: async ip => await IpBans.findOne({
				where: {ip},
				order: [['createdAt', 'DESC']]
			}),
			create: async ipBan => await IpBans.create(ipBan)
		},
		loginAttempts: {
			findAll: async () => await LoginAttempts.findAll(),
			findByUser: async id => await LoginAttempts.findAll({
				where: {user: id},
				order: [['createdAt', 'DESC']]
			}),
			create: async loginAttempt => await LoginAttempts.create(loginAttempt)
		},
		passwordRequests: {
			findAll: async () => await PasswordRequests.findAll(),
			findByUser: async id => await PasswordRequests.findAll({
				where: {user: id},
				order: [['createdAt', 'DESC']]
			}),
			create: async passwordRequest => await PasswordRequests.create(passwordRequest)
		},
		registerRequests: {
			findAll: async () => await RegisterRequests.findAll(),
			findByToken: async token => await RegisterRequests.findOne({
				where: {token}
			}),
			findByEmail: async email => await RegisterRequests.findAll({
				where: {email},
				order: [['createdAt', 'DESC']]
			}),
			findByIp: async ip => await RegisterRequests.findAll({
				where: {ip},
				order: [['createdAt', 'DESC']]
			}),
			update: async request => {
				return await request.save();
			},
			create: async registerRequest => await RegisterRequests.create(registerRequest),
			delete: async request => {
				return await request.destroy();
			}
		},
		requests: {
			findAll: async () => await Requests.findAll(),
			findByIp: async ip => await Requests.findAll({
				where: {ip},
				order: [['createdAt', 'DESC']]
			}),
			findByAccountId: async id => await Requests.findAll({
				where: {accountId: id},
				order: [['createdAt', 'DESC']]
			}),
			create: async request => await Requests.create(request)
		}
	};
};
