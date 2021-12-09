const express = require('express');
const fs = require('fs').promises;
const colors = require('colors/safe');
const path = require('path');

const app = express();

const server = require('http').createServer(app);

const io = require('socket.io')(server);

const handlers = {};
const addons = [];
const _serverglobals = {
	users: {},
	serverNickname: "~",
	serverColor: "white",
	disabledPlugins: []
};
fs.readFile("./config.json").then(configraw => {
	const config = JSON.parse(configraw);
	_serverglobals.serverNickname = config.serverNickname;
	_serverglobals.serverColor = config.serverColor;
	_serverglobals.disabledPlugins = config.disabledPlugins;
}).catch(err => debug.fail('Unable to read config.json -',err));

const debug = {
	ok(...data) {
		console.log(colors.green('OK'),...data);
	},
	fail(...data) {
		console.log(colors.red('FAIL'),...data);
	}
}

;(async()=>{
	let hdir = await fs.readdir("./handlers").catch(err => debug.fail('Unable to load handlers directory -',err.toString().slice(7)));
	if (hdir) {
		for (let handler of hdir) {
			let hfunc = require("./"+path.join("./handlers/",handler));
			handlers[handler.slice(0,-3)] = hfunc;
		}
		debug.ok('Loaded',Object.keys(handlers).length,'handlers')
	}
	let adir = await fs.readdir("./plugins").catch(err => debug.fail('Unable to load plugins directory -',err.toString().slice(7)));
	/*
	Plugin exports should be like:
	{
		name: "My cool plugin",
		description: "does stuff", //optional
		version: "1.0.0",
		on: "sio:user joined",
		run({io, socket, _serverglobals}, ...event) {
			// do stuff
		}
	}
	*/
	if (adir) {
		for (let addon of adir) {
			if (!_serverglobals.disabledPlugins.includes(addon.slice(0,-3))) continue;
			let raddon = require("./"+path.join("./plugins/",addon));
			addons.push({...raddon, id: addon.slice(0,-3)});
			debug.ok(`${colors.yellow("Plugins")} Loaded "${raddon.name}" v${raddon.version}`);
		}
	}
	fs.readdir("./pluginData").catch(err => debug.fail('Unable to find the pluginData directory -',err));
})();

setInterval(() => {
	addons.filter(x => x.on === "server:tick").forEach(x => x.run({io, _serverglobals}));
}, 150)

io.on('connection', socket => {
	for (let handler in handlers) {
		socket.on(handler, handlers[handler].bind(this, {socket, _serverglobals, io}));
	}
	for (let addon of addons) {
		if (!_serverglobals.disabledPlugins.includes(addon.id.slice(0,-3))) continue;
		if (addon.on.startsWith('sio:')) {
			socket.on(addon.on.slice(4), addon.run.bind(this, {socket, _serverglobals, io}));
		}
	}
})

app.get('/', (req, res) => {
  res.send('Duckfall server <script src="/socket.io.js"></script>');
});

server.listen(3000, () => {
  console.log('server started');
	addons.forEach(addon => {
		if (addon.on !== "server:ready") return;
		addon.run({io, _serverglobals, app, server});
	})
});
