const crypto = require('crypto');
module.exports = function(ip_address) {
	return crypto.createHash('sha512')
		.update(ip_address)
		.digest('hex');
}