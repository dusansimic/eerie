const Sequelize = require('sequelize');
const sequelize = new Sequelize({
	host: '192.168.0.17',
	username: 'SA',
	password: 'Trackshittaz10!',
	dialect: 'mssql',
	database: 'Test'
});

const filter = array => {
	return {
		before: array[0],
		after: array[1]
	}
};

sequelize.authenticate()
	.then(() => {
		console.log('Connected to the database!');
	})
	.catch(err => {
		console.log('Error occured while connecting');
		console.error(err);
	});

sequelize.query('SELECT * FROM NUMBERS;')
	.then(data => {
		data = filter(data);
		console.log(data);
	})
	.catch(err => {
		console.log('Error occured while inserting.');
		console.error(err);
	});

sequelize.query('INSERT INTO NUMBERS VALUES(1337);')
	.then(data => {
		data = filter(data);
		console.log(data);
	})
	.catch(err => {
		console.log('Error occured while inserting.');
		console.error(err);
	});

