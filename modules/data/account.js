function Account(id, username, email, password, createdAt, updatedAt) {
	this.id = id;
	this.username = username;
	this.email = email;
	this.password = password;
	this.createdAt = createdAt;
	this.updatedAt = updatedAt;
}

Account.createFromObject = json => {
	// This will add fields from json object, only if they exist.
	// This does allow if the projection from query is actually not entire, for it to still be Account
	return new Account(json.id, json.username, json.email, json.password, json.createdAt, json.updatedAt);
};

module.exports = Account;
