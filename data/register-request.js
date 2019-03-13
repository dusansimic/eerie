/*
	This one will start creation of a new account, via email
	Will also store the 'first' IP, the one you won't get an email about, just because you created an account from it.
 */

function RegisterRequest(id, email, ip, dateCreation, dateExpiry, token, createdAt, updatedAt) {
	this.id = id;
	this.email = email;
	this.ip = ip;
	this.dateCreation = dateCreation;
	this.dateExpiry = dateExpiry;
	this.token = token;
	this.createdAt = createdAt;
	this.updatedAt = updatedAt;
}

RegisterRequest.createFromObject = json => {
	// Same like account.js:13:13
	return new RegisterRequest(json.id, json.email, json.ip, json.dateCreation, json.dateExpiry, json.token, json.createdAt, json.updatedAt);
};

module.exports = RegisterRequest;
