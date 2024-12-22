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
	console.log('pp mess:', m);
	// if(watch[m.keycode]) console.log('i know that one: ', m);
	watch[m.keycode] = watch[m.keycode] ? 0 : m;
	if(m.type == 'hold') {
		hold_save[m.keycode] = !hold_save[m.keycode]  
	}
})

childProcess.stdout.on('data', (data) => {
	let e = data.toString().split(',')
	console.log(e)
	let key = +e[0];
	let state = +e[1] ? 0:1;
	let right;
	if(e[1]==2) state = 1; 
	if(e[1]>1) right = 1
	let device = e[2][1] == 'x';
	
	if (state && key == 17 && right) {
		watch = {};
		return parentPort.postMessage({clear: 1});
	}  // pressing '-' clears all running macros // && state <- from if
	if (state && key == 18 && right) {
		return parentPort.postMessage({pause: 1});
	} 
	if(!device) return; // bot press - ignore
	if(!watch[key]) return; // key not important - ignore
	if(watch[key].right ^ right) return;
	if(watch[key].type == 'hold') {
		if(hold_save[key]==state) return;
		hold_save[key]=state;
		parentPort.postMessage({[key]: state});
	}
	if(!state) return;
	if(watch[key].type == 'toggle') parentPort.postMessage({tog: watch[key].id});
	if(watch[key].type == 'once') parentPort.postMessage({once: watch[key].id});
});

childProcess.on('close', (code) => {
  console.log(`C++ script exited with code ${code}`);
}); 