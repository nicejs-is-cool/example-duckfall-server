module.exports = function(io, _serverglobals) {
	io.emit('update users',_serverglobals.users);
}