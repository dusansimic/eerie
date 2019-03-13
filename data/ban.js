/*
	Type that describes a ban, generally are served ordered by createdAt in descending order
	Can be queried to find out whether or not an account is banned, how much does it last, from who the ban was received...
 */

function Ban(id, user, admin, reason, dateFrom, dateTo, createdAt, updatedAt) {
	this.id = id;
	this.user = user;
	this.admin = admin;
	this.reason = reason;
	this.dateFrom = dateFrom;
	this.dateTo = dateTo;
	this.createdAt = createdAt;
	this.updatedAt = updatedAt;
}

Ban.createFromObject = json => {
	// Same like account.js:13:13
	return new Ban(json.id, json.user, json.admin, json.reason, json.dateFrom, json.dateTo, json.createdAt, json.updatedAt);
};

module.exports = Ban;
