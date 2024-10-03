//key listener
const {parentPort} = require('node:worker_threads');
const path = require("node:path");
const { GlobalKeyboardListener } = require("@futpib/node-global-key-listener");
const v = new GlobalKeyboardListener();

let watch = {}
let tog_save = {}
let hold_save = {}

const { spawn, execFile } = require('child_process');
const childProcess = execFile(path.join(__dirname, "/key-logger.exe"));

parentPort.on('message', m => {
	// console.log('pp mess:', m);
	if(watch[m.keycode]) console.log('i know that one: ', m);
	watch[m.keycode] = watch[m.keycode] ? 0 : m;
})

childProcess.stdout.on('data', (data) => {
	let e = data.toString().split(',')
	// console.log(e)
	let key = +e[0];
	let state = +e[1] ? 0:1;
	if(+e[1]==2) state = 1; 
	let device = e[2][1] == 'x';
	
	if (state && key == 189) {
		watch = {};
		return parentPort.postMessage({clear: 1});
	}  // pressing '-' clears all running macros // && state <- from if
	if(!device) return; // bot press - ignore
	if(!watch[key]) return; // key not important - ignorea
	if(watch[key].type == 'hold') {
		parentPort.postMessage({[key]: state});
	}
	if(!state) return;
	if(watch[key].type == 'toggle') parentPort.postMessage({tog: watch[key].id});
	if(watch[key].type == 'once') parentPort.postMessage({once: watch[key].id});
});

childProcess.on('close', (code) => {
  console.log(`C++ script exited with code ${code}`);
}); 