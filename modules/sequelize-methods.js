const path = require('path');

const sequelize = require('./sequelize-init');
const op = sequelize.Op;
const modelsFolder = path.join(__dirname, '../data/sequelizer/');

const Accounts = sequelize.import(path.join(modelsFolder, 'sequelizer-account'));
const Bans = sequelize.import(path.join(modelsFolder, 'sequelizer-ban'));
const IpBans = sequelize.import(path.join(modelsFolder, 'sequelizer-ip-ban'));
const LoginAttempts = sequelize.import(path.join(modelsFolder, 'sequelizer-login-attempts'));
const PasswordRequest = sequelize.import(path.join(modelsFolder, 'sequelizer-password-request'));
const RegisterRequest = sequelize.import(path.join(modelsFolder, 'sequelizer-register-request'));

module.exports = {
    account: {
        findAll: async () => await Accounts.findAll({raw: true}),
        findById: async id => await Accounts.findOne({
            where: {id: id},
            raw: true
        }),
        findByIdentification: async identification => await Accounts.findOne({
            where: {[Op.or]: [{username: identification}, {email: identification}]}
        }),
        create: async account => Accounts.create(account)
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
            where: {ip: ip}
        }),
        create: async ipBan => await IpBans.create(ipBan)
    }
};
