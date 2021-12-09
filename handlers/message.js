const he = require('he');
module.exports = function({io, socket, _serverglobals}, message) {
	let user = _serverglobals.users[socket.id];
	io.emit('message',{
		...user,
		msg: he.encode(message),
		date: Date.now()
	});
}