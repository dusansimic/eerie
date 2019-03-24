/*
	Password reset request is pretty self-explanatory. It will also hold new IP's,
	and it will also notify new IP's that show up.
 */
const methods = require('./sequelizer/sequelizer-method');

function PasswordRequest(id, user, ip, dateCreation, dateExpiry, token, createdAt, updatedAt) {
	this.id = id || methods.objectId();
	this.user = user;
	this.ip = ip;
	this.dateCreation = dateCreation;
	this.dateExpiry = dateExpiry;
	this.token = token;
	this.createdAt = createdAt;
	this.updatedAt = updatedAt;
}

PasswordRequest.createFromObject = json => {
	// Same like account.js:13:13
	return new PasswordRequest(json.id, json.user, json.ip, json.dateCreation, json.dateExpiry, json.token, json.createdAt, json.updatedAt);
};

module.exports = PasswordRequest;
