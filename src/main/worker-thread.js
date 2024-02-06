//key listener
const {parentPort} = require('node:worker_threads');
const path = require("node:path");
const { GlobalKeyboardListener } = require("@futpib/node-global-key-listener");
const v = new GlobalKeyboardListener();
let hold_watch = {}
let hold_save = {}

const { spawn } = require('child_process');
const childProcess = spawn(path.join(process.cwd(), "src/main/key-logger.exe"));

childProcess.stdout.on('data', (data) => {
  // console.log(data.toString().split(','));
	let [key, state, device] = data.toString().split(',');
	if (key == 189) return parentPort.postMessage('clear'); // pressing '-' clears all running macros 
	if(!device) return; // bot press - ignore
	if(!hold_watch[key]) return; // key not important - ignore
	state = state == 0 ? 1:0; //toggle 
	if(hold_save[key] != state) {
		hold_save[key] = state;    
		parentPort.postMessage(JSON.stringify({[key]: state}))
	}
});

childProcess.on('close', (code) => {
  console.log(`C++ script exited with code ${code}`);
});