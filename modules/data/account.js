const keys = ['id', 'username', 'email', 'password', 'createdAt', 'updatedAt'];

function Account(id, username, email, password, createdAt, updatedAt)
{
	this.id = id;
	this.username = username;
	this.email = email;
	this.password = password;
	this.createdAt = createdAt;
	this.updatedAt = updatedAt;
}

Account.createFromObject = json => {
	let good = true;

	// We need to check if our object actually has everything necessary to create
	keys.forEach(key => {
		if (!Object.keys(json).includes(key)) {
			good = false;
		}
	});

	// If it's all good, we can create an account, and we can move on
	// Otherwise just return null
	if (good) {
		return new Account(json.id, json.username, json.email, json.password, json.createdAt, json.updatedAt);
	} else {
		return null;
	}
};

module.exports = Account;
