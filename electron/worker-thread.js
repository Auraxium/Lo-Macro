const {parentPort} = require('node:worker_threads');

const robot = require("@jitsi/robotjs");
// const ioHook = require('@spacek33z/iohook');
const {uIOhook, UiohookKey} = require('uiohook-napi')
const { GlobalKeyboardListener } = require("@futpib/node-global-key-listener");
const v = new GlobalKeyboardListener();

let running = {};
let holding = {};

robot.setKeyboardDelay(10)

parentPort.on('message', m => {
	let pl = JSON.parse(m);
	if(pl.type == 'macro')
		runMacro(JSON.parse(pl.pl));
	if(pl.type == 'key') {
		let temp = Object.entries(pl.data)
		holding[temp[0][0]] = temp[0][1]
		// console.log(holding);
	}
	if(pl.type == 'clear')
		clear()
})

async function runMacro(mac) {
  // console.log('this is the mac', mac);
  if (!mac) return console.log("bro wut");

  if (running[mac.id]) {
    console.log("was already running so stopped");
    return (running[mac.id] = 0);
  }          
 
  running[mac.id] = 1;                  
  while (running[mac.id]) {
		// console.log(holding);

		if(holding['SPACE']) {
			console.log('running');
			robot.keyTap(mac.inputs[0].key);
		}
    	
		
		// console.log('holding so running');
    await Delay(100);
  }
}

function clear() {
  running = {};
	holding = {};
	// ipcMain.
}

async function Delay(secs) {
  return new Promise((res) => setTimeout(() => res(""), secs));
}

