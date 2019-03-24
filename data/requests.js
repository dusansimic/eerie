/*
	This is a model in which we record the requests
	Every request will be tracked, with some necessary info
 */

function Request(ip, requestPath, date, accountId, statusCode, createdAt, updatedAt) {
	this.ip = ip;
	this.requestPath = requestPath;
	this.date = date;
	this.accountId = accountId;
	this.statusCode = statusCode;
	this.createdAt = createdAt;
	this.updatedAt = updatedAt;
}

Request.createFromObject = json => {
	return new Request(json.ip, json.requestPath, json.date, json.accountId, json.statusCode, json.createdAt, json.updatedAt);
};

module.exports = Request;
