/*
	This is a type that describes an user account.
	Pretty much the one thing containing the most important data when registering, logging in
 */

function Account(id, username, email, password, role, status, createdAt, updatedAt) {
	this.id = id;
	this.username = username;
	this.email = email;
	this.password = password;
	this.role = role;
	this.status = status;
	this.createdAt = createdAt;
	this.updatedAt = updatedAt;
}

Account.createFromObject = json => {
	// This will add fields from json object, only if they exist.
	// This does allow if the projection from query is actually not '*', for it to still be Account
	return new Account(json.id, json.username, json.email, json.password, json.role, json.status, json.createdAt, json.updatedAt);
};

module.exports = Account;
