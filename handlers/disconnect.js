const updateUsers = require("../utils/updateusers.js");
module.exports = function({_serverglobals, io, socket}) {
	if (!_serverglobals.users[socket.id]) return;
	let user = _serverglobals.users[socket.id];
	delete _serverglobals.users[socket.id];
	io.emit('user left',user);
	updateUsers(io, _serverglobals);
}