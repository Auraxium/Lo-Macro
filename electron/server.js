import keymap from './key-map'
const { ipcMain } = require("electron");
const fs = require("fs");
const path = require("node:path");
const robot = require("@jitsi/robotjs");
const {uIOhook} = require('uiohook-napi')
const {Worker} = require('worker_threads');
const worker = new Worker('./electron/worker-thread.js')
// const cluster = require('cluster');

const { GlobalKeyboardListener } = require("@futpib/node-global-key-listener");
const v = new GlobalKeyboardListener();

let macros = {};
let running = {};
let holding = {};
let running_save = false;

robot.setKeyboardDelay(10)
worker.on('message', m => {
	if(m == 'clear') return clear()
	let temp = Object.entries(JSON.parse(m))[0];
	holding[temp[0]] = temp[1];
	// worker.postMessage('ok')
})

try {
  macros = JSON.parse(fs.readFileSync(path.join(__dirname, "../macros.json")));
} catch (e) {
  console.log("no data");
}

// console.log(macros);

async function Delay(secs) {
  return new Promise((res) => setTimeout(() => res(""), secs));
}

async function runMacro(mac) {
  // console.log('this is the mac', mac);
  if (!mac) return console.log("bro wut");

  if (running[mac.id]) {
    console.log("was already running so stopped");
    return (running[mac.id] = 0);
  }

	let key = mac.keycode//mac.key.toUpperCase()
	worker.postMessage(key)
  running[mac.id] = 1;
  while (running[mac.id]) {
		if(holding[key]) 
    	uIOhook.keyTap(keymap[mac.inputs[0].key]);
    await Delay(50);
  }
}

//#region BRO

ipcMain.on("run", (e, pl) => {
  runMacro(JSON.parse(pl));
});

ipcMain.on("halt", (e, pl) => {
  running[pl] = 0;
});

ipcMain.on("save", (e, payload) => {
  macros = JSON.parse(payload);
  // console.log(macros);
  fs.writeFileSync(path.join(__dirname, "../macros.json"), payload);
  e.reply("reply", "saved");
});

ipcMain.on("load", (e, payload) => {
  e.reply("load", JSON.stringify(macros));
});


export function clear() {
	holding = {};
	// if(running_save) {
	// 	running = {...running_save}
	// 	return running_save = false;
	// }
	// running_save = {...running}
  running = {};
	// ipcMain.
}

//#endregion

