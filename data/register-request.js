/*
	This one will start creation of a new account, via email
	Will also store the 'first' IP, the one you won't get an email about, just because you created an account from it.
 */
const methods = require('./sequelizer/sequelizer-method');

function RegisterRequest(id, email, role, ip, used, dateCreation, dateExpiry, dateLastSent, token, createdAt, updatedAt) {
	this.id = id || methods.objectId();
	this.email = email;
	this.role = role;
	this.ip = ip;
	this.used = used;
	this.dateCreation = dateCreation;
	this.dateExpiry = dateExpiry;
	this.dateLastSent = dateLastSent;
	this.token = token;
	this.createdAt = createdAt;
	this.updatedAt = updatedAt;
}

RegisterRequest.createFromObject = json => {
	// Same like account.js:13:13
	return new RegisterRequest(json.id, json.email, json.role, json.ip, json.used, json.dateCreation, json.dateExpiry, json.dateLastSent, json.token, json.createdAt, json.updatedAt);
};

module.exports = RegisterRequest;
