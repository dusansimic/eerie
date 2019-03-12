function Ban(id, identification, admin, reason, dateFrom, dateTo, createdAt, updatedAt) {
	this.id = id;
	this.identification = identification;
	this.admin = admin;
	this.reason = reason;
	this.dateFrom = dateFrom;
	this.dateTo = dateTo;
	this.createdAt = createdAt;
	this.updatedAt = updatedAt;
}

Ban.createFromObject = json => {
	// Same like account.js:13:13
	return new Ban(json.id, json.identification, json.admin, json.reason, json.dateFrom, json.dateTo, json.createdAt, json.updatedAt);
};

module.exports = Ban;
