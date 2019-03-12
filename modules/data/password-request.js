function PasswordRequest(id, identification, dateCreation, dateExpiry, token, createdAt, updatedAt) {
	this.id = id;
	this.identification = identification;
	this.dateCreation = dateCreation;
	this.dateExpiry = dateExpiry;
	this.token = token;
	this.createdAt = createdAt;
	this.updatedAt = updatedAt;
}

PasswordRequest.createFromObject = json => {
	// Same like account.js:13:13
	return new PasswordRequest(json.id, json.identification, json.dateCreation, json.dateExpiry, json.token, json.createdAt, json.updatedAt);
};

module.exports = PasswordRequest;
