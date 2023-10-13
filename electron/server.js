const { ipcMain, globalShortcut } = require("electron");
const fs = require("fs");
const path = require("node:path");
// const kb = require("node-key-sender");
const { GlobalKeyboardListener } = require("@futpib/node-global-key-listener");
const v = new GlobalKeyboardListener();

const {Worker} = require('worker_threads');
const worker = new Worker('./electron/worker-thread.js')

let macros;
let hold_watch = {SPACE: 1}
let hold_save = {SPACE: 0}

try {
  macros = JSON.parse(fs.readFileSync(path.join(__dirname, "../macros.json")));
} catch (e) {
  console.log("no data");
}

v.addListener((e) => {
  if (e.name == "MINUS") return worker.postMessage(JSON.stringify({type: 'clear'}));
  if (e._raw.length > 30) return;
	// console.log(e._raw);
	if(!hold_watch[e.name]) return;
	let state = e.state == 'DOWN' ? 1:0;
	if(hold_save[e.name] != state) {
		hold_save[e.name] = state;
		// console.log('state change', new Date());
		worker.postMessage(JSON.stringify({type: 'key', data: {SPACE: state}}))
	}
  // console.log(e.state == "DOWN" ? 'holding space' : 'let go of space');
});

//#region BRO

ipcMain.on("run", (e, pl) => {
  // runMacro(JSON.parse(pl));
	worker.postMessage(JSON.stringify({type: 'macro', pl: pl}));
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



//#endregion

/*#region JUNK

worker.on('message', m => {
	let temp = JSON.parse(m);
	holding = {...holding, ...temp}
})

parentPort.on('message', m => {

})
		parentPort.postMessage(JSON.stringify({SPACE: state}))

const cluster = require('cluster');

uIOhook.on('keydown', (e) => {
 console.log(e);
hold['SPACE']++
})
uIOhook.start()

#endregion */

