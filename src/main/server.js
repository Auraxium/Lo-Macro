import { join } from "path";
import keymap from "./key-map";
const { ipcMain } = require("electron");
const fs = require("fs");
const path = require("node:path");
const robot = require("@jitsi/robotjs");
const { uIOhook, UiohookKey } = require("uiohook-napi");
const { Worker } = require("worker_threads");
const os = require("os");
const worker = new Worker(path.join(process.cwd(), "src/main/worker-thread"));
// const cluster = require('cluster');

const { GlobalKeyboardListener } = require("@futpib/node-global-key-listener");
const v = new GlobalKeyboardListener();

let macros = {};
let running = {};
let holding = {};
let bind = {};
let paused = false;
let running_save = false;

try {
  macros = JSON.parse(fs.readFileSync(path.join(process.cwd(), "/macros.json")));
} catch (e) {
  console.log("no data");
}

robot.setKeyboardDelay(100);
robot.setMouseDelay(100);

worker.on("message", (m) => {
  if (m == "clear") return clear();
  let [key, state] = Object.entries(JSON.parse(m))[0];
	// console.log('this the key ', key, state);
	if(bind[key] > -1) {
		return state ? keyDown(bind[key]) : keyUp(bind[key]);
	}
  holding[key] = state;
});

let types = {
  hold: async function (mac) {
    while (running[mac.id]) {
      if (paused) {
        await Delay(100);
        continue;
      }
      if (holding[mac.keycode]) await keyTap(keymap[mac.inputs[0].key]);
      await Delay(100);
    }
  },
  bind: async function (mac) {
    bind[mac.keycode] = keymap[mac.inputs[0].key];
  },
  once: async function () {},
};

async function runMacro(mac) {
  // console.log('this is the mac', mac);
  if (!mac) return console.log("bro wut");

  if (running[mac.id]) {
    console.log("was already running so stopped");
		worker.postMessage(mac.keycode);
		return (running[mac.id] = 0);
  }
	worker.postMessage(mac.keycode);
	running[mac.id] = 1;

  types[mac.type](mac);
}

async function Delay(secs) {
  return new Promise((res) => setTimeout(() => res(""), secs));
}

async function keyTap(key) {
	// keyDown(key);
	// await Delay(50);
	// keyUp(key);
	return key ? uIOhook.keyTap(key) : robot.mouseClick();
}

 function keyDown(key) {
  return key ? uIOhook.keyToggle(key, "down") : robot.mouseToggle("down");
}

 function keyUp(key) {
  return key ? uIOhook.keyToggle(key, "up") : robot.mouseToggle("up");
}

async function test() {
	while(true) {
		await Delay(2000)
		mouseTap()
	}
}

// test()

//#region BRO

ipcMain.on("run", (e, pl) => {
  // console.log(pl);
  runMacro(JSON.parse(pl));
});

ipcMain.on("halt", (e, pl) => {
  running[pl] = 0;
  console.log("aeasfvznsjfordfdjg;kcbnfjlsnfksorjgdkslejgdlskejglsjgkekgjlsmvfjsd");
});

ipcMain.on("save", (e, payload) => {
  macros = JSON.parse(payload);
  // console.log(macros);
  fs.writeFileSync(path.join(process.cwd(), "macros.json"), payload);
  e.reply("reply", "saved");
});

ipcMain.on("load", (e, payload) => {
  // console.log(macrdos);
  e.reply("load", JSON.stringify(macros));
});

ipcMain.on('running', (e, payload) => {
	// console.log(running);
	e.reply('running', JSON.stringify(running))
}) 

export function clear() {
  paused = !paused;
}

//#endregion
