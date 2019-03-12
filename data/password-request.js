function PasswordRequest(id, user, dateCreation, dateExpiry, token, createdAt, updatedAt) {
	this.id = id;
	this.user = user;
	this.dateCreation = dateCreation;
	this.dateExpiry = dateExpiry;
	this.token = token;
	this.createdAt = createdAt;
	this.updatedAt = updatedAt;
}

PasswordRequest.createFromObject = json => {
	// Same like account.js:13:13
	return new PasswordRequest(json.id, json.user, json.dateCreation, json.dateExpiry, json.token, json.createdAt, json.updatedAt);
};

module.exports = PasswordRequest;
