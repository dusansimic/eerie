function RegisterRequest(id, email, dateCreation, dateExpiry, token, createdAt, updatedAt) {
	this.id = id;
	this.email = email;
	this.dateCreation = dateCreation;
	this.dateExpiry = dateExpiry;
	this.token = token;
	this.createdAt = createdAt;
	this.updatedAt = updatedAt;
}

RegisterRequest.createFromObject = json => {
	// Same like account.js:13:13
	return new RegisterRequest(json.id, json.email, json.dateCreation, json.dateExpiry, json.token, json.createdAt, json.updatedAt);
};

module.exports = RegisterRequest;
