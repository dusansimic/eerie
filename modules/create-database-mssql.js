const Tedious = require('tedious');
const Connection = Tedious.Connection;
const Request = Tedious.Request;
const env = require('./environment-variables');

const config = {
	server: env.host,
	options: {
		encrypt: !!env.encrypt,
		requestTimeout: 60000
	},
	authentication: {
		type: 'default',
		options: {
			userName: env.authenticationData.username,
			password: env.authenticationData.password
		}
	}
};

const createConnection = function () {
	return new Promise(resolve => {
		const connection = new Connection(config);
		connection.on('connect', error => {
			if (error) {
				resolve(error);
			}
			console.log('Tedious connected!');
			connection.execSql(new Request('CREATE DATABASE Authentication;', (error, rows) => {
				if (error) {
					if (error.message.includes('already exists')) {
						connection.close();
						return resolve();
					}
					resolve(error);
					return console.log('Tedious experienced an error : ' + error.message);
				}
				console.log('Successfully created database Authentication ' + rows);
				connection.close();
				resolve();
			}));
		});
	});
};

module.exports = async function () {
	await createConnection();
};