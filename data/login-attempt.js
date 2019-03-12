function LoginAttempt(id, user, ip, success, createdAt, updatedAt) {
	this.id = id;
	this.user = user;
	this.ip = ip;
	this.success = success;
	this.createdAt = createdAt;
	this.updatedAt = updatedAt;
}

LoginAttempt.createFromObject = json => {
	// Same like account.js:13:13
	return new LoginAttempt(json.id, json.user, json.ip, json.success, json.createdAt, json.updatedAt);
};

module.exports = LoginAttempt;
