const createServerMessage = require("../utils/createServerMessage");
const fs = require('fs').promises;
let welcomeMessage = "";
fs.readFile("./pluginData/welcomeMessage.txt",{encoding: 'utf-8'})
	.catch(() => 
		fs.writeFile("./pluginData/welcomeMessage.txt","Welcome!",{encoding: 'utf-8'})
	)
	.then(x => welcomeMessage = x)

module.exports = {
		name: "Welcome",
		description: "Shows a welcome message when someone joins your server", //optional
		version: "1.0.0",
		on: "sio:user joined",
		run({io, socket, _serverglobals}, ...event) {
			socket.emit('message', createServerMessage(_serverglobals.serverNickname, _serverglobals.serverColor, welcomeMessage));
		}
}