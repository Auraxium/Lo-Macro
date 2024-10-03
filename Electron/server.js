// #region INIT
const keymap = require("./key-map");
const { ipcMain } = require("electron");
const fs = require("fs");
const path = require("node:path");
const robot = require("@jitsi/robotjs");
const { uIOhook, UiohookKey } = require("uiohook-napi");
const { Worker } = require("worker_threads");
const worker = new Worker(`${__dirname}/worker-thread`);
// const cluster = require('cluster');

mac_path = path.join(global.app.getPath('userData'), 'macros.json')
console.log(mac_path);

const { GlobalKeyboardListener } = require("@futpib/node-global-key-listener");
const v = new GlobalKeyboardListener();

let macros = {};
let running = {};
let holding = {};
let togs = {};
let bind = {};
let paused = {};
let running_save = false;

try {
  macros = JSON.parse(fs.readFileSync(mac_path))
} catch (e) {
  console.log("no data");
}

robot.setKeyboardDelay(100);
robot.setMouseDelay(100);

//#endregion

worker.on("message", (m) => { ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // console.log('worker msg:', m);
  if (m.clear) return clear();
  if (m.tog) {
    paused[m.tog] = paused[m.tog] ? 0 : 1;
    send('running', JSON.stringify({running, paused}))
    return;
  }
  if (m.once) {
    console.log(m.once);
    types['once'](macros[m.once])
    return;
  }
  let [key, state] = Object.entries(m)[0];
  // console.log('this the key ', key, state);
  if (bind[key] > -1) {
    return state ? keyDown(bind[key]) : keyUp(bind[key]);
  }
  holding[key] = state;
});

let types = {
  hold: async function (mac) {
    if (!mac) return console.log('no namc??');
    while (running[mac.id]) {
      if (paused) {
        await Delay(100);
        continue;
      }
      if (holding[mac.keycode]) await keyTap(e);
      await Delay(40 + (Math.random() * 100));
    }
  },
  toggle: async function (mac) {
    // console.log(mac.inputs[0].key, keymap.space, keymap[mac.inputs[0].key]);4
    while (running[mac.id]) {
      await Delay(Math.random() * 200);
      for (let e of mac.inputs)
        if (running[mac.id] && !paused[mac.id]) await keyTap(e)
        else await Delay(1000)
    }
  },
  bind: async function (mac) {
    bind[mac.keycode] = keymap[mac.inputs[0].key];
  },
  once: async function (mac) {
    console.log(mac);
    for (let e of mac.inputs) await keyTap(e);
  },
};

async function runMacro(mac) {
  if (!mac) return console.log("bro wut");
  console.log(running);
  if (running[mac.id]) {
    console.log("was already running so stopped");
    worker.postMessage({ keycode: mac.keycode, type: mac.type });
    running[mac.id] = 0;
    paused[mac.id] = 0;
    send('running', JSON.stringify({running, paused}));
    return;c
  }
  running[mac.id] = 1;
  worker.postMessage({ keycode: mac.keycode, type: mac.type, id: mac.id });
  if(mac.type != 'once')
    types[mac.type](mac);
}

async function keyTap(e) {
  // console.log('i never got here');
  await Delay(40 + (Math.random() * 100));
  if (e.delay) return await Delay(+e.delay);

  let keycode = keymap[e.key.toLowerCase()];

  if (e.move) {
    let x = e.move[0] + ~~(Math.random() * 6);
    let y = e.move[1] + ~~(Math.random() * 6);
    robot.moveMouseSmooth(x, y, 1);
    let to = Date.now() + 1500;
    while (!Range(x, robot.getMousePos().x, 8) && !Range(y, robot.getMousePos().y, 8) && Date.now() < to) await Delay(200);
  }

  // console.log('keycode', keycode, e.key);
  keyDown(keycode);
  let r = (Math.random() * 60)
  // console.log(r);
  await Delay((e.down_ || 70) + r);
  keyUp(keycode);
}

function keyDown(key) {
  return +key ? uIOhook.keyToggle(key, "down") : robot.mouseToggle("down");
}

function keyUp(key) {
  return +key ? uIOhook.keyToggle(key, "up") : robot.mouseToggle("up");
}

// test()


//#region BRO

ipcMain.on("run", (e, pl) => {
  // console.dir(">>>>");
  runMacro(JSON.parse(pl));
});

ipcMain.on("halt", (e, pl) => {
  running[pl] = 0;
  console.log("aeasfvznsjfordfdjg;kcbnfjlsnfksorjgdkslejgdlskejglsjgkekgjlsmvfjsd");
});

ipcMain.on("save", (e, payload) => {
  if (payload.length < 4) return;
  macros = JSON.parse(payload);
  // console.log('saving');
  fs.writeFileSync(mac_path, payload);
  e.reply("reply", "saved")
});

ipcMain.on("load", (e, payload) => {
  // console.log('loading', JSON.stringify(macros));
  e.reply("load", JSON.stringify(macros));
});

ipcMain.on('running', (e, payload) => {
  // console.log(e);
  send = e.reply;
})

function clear() {
  running = {};
  holding = {};
  togs = {};
  bind = {};
  paused = {};
  send('running', "{}")
}

async function Delay(secs) {
  return new Promise((res) => setTimeout(() => res(""), secs));
}

function Range(start, end, range) {
  return Math.abs(start - end) <= range;
}



// setInterval(e => console.log(robot.getMousePos()), 1000)
// 52.39309347734619
// 55.63328882419987
//#endregion