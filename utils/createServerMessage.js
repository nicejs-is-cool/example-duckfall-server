module.exports = function(username, color, message) {
	return {
		nick: username,
		color,
		msg: message,
		date: Date.now(),
		home: "trollbox"
	};
}