function IpLog(id, identification, ip, createdAt, updatedAt) {
	this.id = id;
	this.identification = identification;
	this.ip = ip;
	this.createdAt = createdAt;
	this.updatedAt = updatedAt;
}

IpLog.createFromObject = json => {
	// Same like account.js:13:13
	return new IpLog(json.id, json.identification, json.ip, json.createdAt, json.updatedAt);
};

module.exports = IpLog;
