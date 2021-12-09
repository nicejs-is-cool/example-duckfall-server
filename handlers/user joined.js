const homegen = require("../utils/homegen.js");
const updateUsers = require("../utils/updateusers.js");
module.exports = function({_serverglobals, io, socket}, pseudo, color, style, passwd) {
	
	const ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address;
	const home = homegen(ip);
	let user = {
		nick: pseudo,
		color,
		style,
		home
	}
	_serverglobals.users[socket.id] = user;
	io.emit('user joined', user);
	updateUsers(io, _serverglobals);
	
}