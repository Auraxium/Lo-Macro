//key listener
const {parentPort} = require('node:worker_threads');
const path = require("node:path");
const { GlobalKeyboardListener } = require("@futpib/node-global-key-listener");
const v = new GlobalKeyboardListener();
let hold_watch = {}
let hold_save = {}

const { spawn } = require('child_process');
const childProcess = spawn(path.join(process.cwd(), "src/main/key-logger.exe"));

parentPort.on('message', m => {
	hold_watch[m] = hold_watch[m] ? 0 : 1;
})

childProcess.stdout.on('data', (data) => {
	let e = data.toString().split(',')
	// console.log(e)
	let key = +e[0];
	let state = +e[1] ? 0:1;
	let device = e[2][1] == 'x';
	if (key == 189 && state) return parentPort.postMessage('clear'); // pressing '-' clears all running macros 
	if(!device) return; // bot press - ignore
	if(!hold_watch[key]) return; // key not important - ignore
	if(hold_save[key] != state) {
		hold_save[key] = state;    
		parentPort.postMessage(JSON.stringify({[key]: state}))
	}
});

childProcess.on('close', (code) => {
  console.log(`C++ script exited with code ${code}`);
});