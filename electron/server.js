const { ipcMain, globalShortcut } = require("electron");
const fs = require("fs");
const path = require("node:path");
const kb = require("node-key-sender");
const robot = require("@jitsi/robotjs");
// const ioHook = require('@spacek33z/iohook');
const {uIOhook, UiohookKey} = require('uiohook-napi')
const {Worker} = require('worker_threads');
const worker = new Worker('./electron/worker-thread.js')

// const cluster = require('cluster');

// uIOhook.on('keydown', (e) => {
//  console.log(e);
// hold['SPACE']++
// })
// uIOhook.start()

const { GlobalKeyboardListener } = require("@futpib/node-global-key-listener");
const v = new GlobalKeyboardListener();

// const app = require('./main')

let macros;
let running = {};
let holding = {};

robot.setKeyboardDelay(10)
worker.on('message', m => {
	let temp = JSON.parse(m);
	holding = {...holding, ...temp}
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
 
  running[mac.id] = 1;
  while (running[mac.id]) {
		// if(holding['SPACE']) 
    	robot.keyTap(mac.inputs[0].key);
		
		// console.log('holdign so running');
    await Delay(100);
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
  running = {};
	holding = {};
	// ipcMain.
}

//#endregion

