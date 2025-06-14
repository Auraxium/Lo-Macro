//key listener
const { parentPort } = require('node:worker_threads');
const path = require("node:path");
const { GlobalKeyboardListener } = require("@futpib/node-global-key-listener");
const v = new GlobalKeyboardListener();

let watch = {}
let up_care = { 'bind': 1, 'toggle': 1, 'hold': 1 }
let down = { '0': 1, '1': 0, '2': 1, '3': 0, };
let mdown = { '0': 1, '1': 0, '3': 1, '7': 0, '15': 1, '31': 0 };
let click = { '0': 0, '1': 0, '3': -2, '7': -2, '15': -1, '31': -1 };
let hold_save = {};

const { spawn, execFile } = require('child_process');
let logger;

parentPort.on('message', m => {
	// console.log('pp mess:');
	if (!logger) init();
	watch[m.keycode] = watch[m.keycode] ? 0 : m;
});

function init() {
	console.log('(re)started key log')
	logger = execFile(path.join(__dirname, "/key-logger.exe"), () => {
		init()
	});

	logger.stdout.on('data', (data) => {
		let e = data.toString().split(',');
		// console.log(e);
		let key, state, dt=down;
		key = +e[0];
		if(!key) {
			key = click[e[1]];
			dt=mdown;
		 }
		state = dt[e[1]];
		device = e[2][1] == 'x';

		// console.log(key, state)

		if (!state && key == 33 /* && right */) {
			watch = {};
			return parentPort.postMessage(['clear', 1]);
		}  // pressing '-' clears all running macros // && state <- from if
		if (!state && key == 35 /* && right */) {
			return parentPort.postMessage(['pause', 1]);
		}
		if (!state && key == 36 /* && right */) {
			return parentPort.postMessage(['pause', 2]);
		}
		if (!device) return; // bot press - ignore
		if (!watch[key]) return; // key not important - ignore

		if (hold_save[key] && state) return;
		hold_save[key] = state;
		if (!state && !up_care[watch[key].type]) return;

		// hold_save[key] = 1
		parentPort.postMessage([watch[key].type, watch[key].id, state]);
	});	
}

init()

//to build, just run. itll generate .exe