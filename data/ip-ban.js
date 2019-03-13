/*
	Next to a regular ban, I wanted to include an IP ban.
	Similar to a regular one, just intended for IP's
 */

function IpBan(id, ip, admin, reason, dateFrom, dateTo, createdAt, updatedAt) {
	this.id = id;
	this.ip = ip;
	this.admin = admin;
	this.reason = reason;
	this.dateFrom = dateFrom;
	this.dateTo = dateTo;
	this.createdAt = createdAt;
	this.updatedAt = updatedAt;
}

IpBan.createFromObject = json => {
	// Same like account.js:13:13
	return new IpBan(json.id, json.ip, json.admin, json.reason, json.dateFrom, json.dateTo, json.createdAt, json.updatedAt);
};

module.exports = IpBan;
