// #region INIT
const express = require("express");
const ex = express();
const keymap = require("./key-map");
const fs = require("fs");
const path = require("node:path");
const robot = require("@jitsi/robotjs");
const { uIOhook, UiohookKey } = require("uiohook-napi");
const { Worker } = require("worker_threads");
const worker = new Worker(`${__dirname}/worker-thread`);

// const cluster = require('cluster');
const { spawn, execFile } = require("child_process");

// const py = execFile(path.join(__dirname, "dist/kp.exe"));
const py = spawn("py", [path.join(__dirname, "kp.py")]);

py.on("exit", (code) => {
  console.log(`Python process exited with code ${code}, respawning...`);
  py = execFile(path.join(__dirname, "dist/kp.exe"));
});

py.on("error", (err) => {
  console.error(`Python process error: ${err}, respawning...`);
  py = execFile(path.join(__dirname, "dist/kp.exe"));
});

const { GlobalKeyboardListener } = require("@futpib/node-global-key-listener");
const { isArray } = require("node:util");
const v = new GlobalKeyboardListener();

let reply;
let send;

let macros = global.data.macros;
let sets = global.data.sets;

let running = {};
let paused = {};
let hard_pause = false;
let mk = {
  lc: "left",
  mc: "middle",
  rc: "right",
};

let timeout;
let block = 0;

if (send) send("load", JSON.stringify(macros));

robot.setKeyboardDelay(100);
robot.setMouseDelay(100);

//#endregion

//#region MAIN

msgs = {
  clear: () => clear(),
  pause: (m) => {
    Object.keys(running).forEach((e) => {
      // if(macros[e].type == )
      paused[e] = 1;
      macros[e] && macros[e].inputs.forEach((el) => !el.delay && keyUp(el.keycode || el.key));
    });
    if (m[1] == 2) {
      hard_pause = 1;
      send("pausa", 1);
      return tempPause();
    }
    if (timeout) {
      clearTimeout(timeout);
      return (timeout = null);
    }
    clearTimeout(timeout);
    timeout = null;
    hard_pause = !hard_pause;
    send("pausa", hard_pause);
  },
  once: (m) => {
    types["once"](macros[m[1]]);
  },
  hold: (m) => {
    paused[m[1]] = !m[2];
  },
  loop: (m) => {
    paused[m[1]] = paused[m[1]] ? 0 : 1;
  },
  toggle: (m) => {
    if (hard_pause) return;
    if (m[2] == 1) return;
    paused[m[1]] = !paused[m[1]];
    // console.log(paused[m]);
    types["toggle"](macros[m[1]]);
  },
  bind: (m) => {
    if (hard_pause) return;
    // if (m[2] == 1) return;
    paused[m[1]] = !m[2];
    paused[m[1]] ? keyUp(macros[m[1]].inputs[0].key) : keyDown(macros[m[1]].inputs[0].key);
  },
};

worker.on("message", (m) => {
  // console.log('worker msg:', m);
  if (msgs[m[0]]) msgs[m[0]](m);
  send("running", JSON.stringify({ running, paused }));
});

let types = {
  once: async function (mac) {
    if (hard_pause) return;
    send("reflow", mac.id);
    for (let e of mac.inputs)
      if (running[mac.id] && !hard_pause) await keyTap(e);
      else break;
  },
  hold: async function (mac) {
    let delay = mac.inputs.length * 40;
    while (running[mac.id]) {
      await Delay(Math.random() * delay);
      if (pausa(mac.id)) {
        await Delay(100);
        continue;
      }
      if (delay > 40) send("reflow", mac.id);
      for (let e of mac.inputs)
        if (running[mac.id] && !pausa(mac.id)) await keyTap(e);
        else break;
    }
  },
  loop: async function (mac) {
    let delay = mac.inputs.length * 40;
    while (running[mac.id]) {
      await Delay(Math.random() * delay);
      if (pausa(mac.id)) {
        await Delay(750);
        continue;
      }
      if (delay > 40) send("reflow", mac.id);
      for (let e of mac.inputs) {
        // console.log('???????');
        if (running[mac.id] && !pausa(mac.id)) await keyTap(e);
        else break;
      }
    }
  },
  toggle: async function (mac) {
    pausa(mac.id) ? keyUp(mac.inputs[0].key) : keyDown(mac.inputs[0].key);
  },
  bind: async function (mac) {
    // bind[mac.keycode] = keymap[mac.inputs[0].key];
  },
};

function runMacro(mac) {
  if (!mac) return console.log("bro wut");
  // console.log(mac);
  if (mac.length) return mac.forEach((e) => runMacro(e));
  if (running[mac.id]) {
    //off
    // console.log("was already running so stopped");
    worker.postMessage({ keycode: mac.keycode, type: mac.type });
    running[mac.id] = 0;
    paused[mac.id] = 0;
    if (mac.type.length == 6) keyUp(mac.inputs[0].key);
    return;
  }
  running[mac.id] = 1;
  paused[mac.id] = 1;
  worker.postMessage({ keycode: mac.keycode, type: mac.type, id: mac.id });
  // console.log(mac);
  if (mac.type != "once") types[mac.type](mac);
  // send('running', JSON.stringify({ running, paused }));
}

async function keyTap(e) {
  // console.log('i never got here');
  await Delay(40 + Math.random() * 100);
  if (e.delay) return await Delay(e.duration);
  if (e.key == "delay") return await Delay(e.duration);

  let keycode = keymap[e.key] || e.key;

  if (e.move) {
    let x = e.move[0] + ~~(Math.random() * 6);
    let y = e.move[1] + ~~(Math.random() * 6);
    robot.moveMouseSmooth(x, y, 1);
    let to = Date.now() + 1500;
    while (!Range(x, robot.getMousePos().x, 8) && !Range(y, robot.getMousePos().y, 8) && Date.now() < to) await Delay(200);

    robot.mouseToggle("down");
    let r = Math.random() * 60;
    // console.log(r);
    await Delay((e.duration || 70) + r);
    robot.mouseToggle("up");
    return;
  }

  // console.log('keycode', keycode, e.key);
  keyDown(keycode);
  let r = Math.random() * 60;
  // console.log(r);
  await Delay((e.duration || 70) + r);
  keyUp(keycode);
}

function keyDown(key) {
  if (key in mk) return robot.mouseToggle("down", mk[key]);
  py.stdin.write(`${key}$0\n`);
  // return +key ? uIOhook.keyToggle(key, "down") : robot.mouseToggle("down");
}

function keyUp(key) {
  if (key in mk) return robot.mouseToggle("up", mk[key]);
  py.stdin.write(`${key}$1\n`);
  // return +key ? uIOhook.keyToggle(key, "up") : robot.mouseToggle("up");
}

//#endregion

//#region elpers

function pausa(id) {
  return paused[id] || hard_pause;
}

function clear() {
  Object.keys(running).forEach((e) => macros[e] && macros[e].inputs.forEach((el) => !el.delay && keyUp(el.keycode || el.key)));
  running = {};
  paused = {};
  hard_pause = 0;
  send("running", "{}");
}

async function Delay(secs) {
  return new Promise((res) => setTimeout(() => res(""), secs));
}

function Range(start, end, range) {
  return Math.abs(start - end) <= range;
}

global.debounce = function (cb, delay = 1000) {
  timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
};

var tempPause = global.debounce(() => {
  timeout = null;
  hard_pause = 0;
  send("pausa", 0);
}, 1000 * 7);

//#endregion

//#region ipc events
ex.post('/run', (req, res) => {
  let macs = req.pl;
})

ipcMain.on("run", (e, pl) => {
  let macs = JSON.parse(pl);
  // macs = macs.map(e => global.macros[e])
  console.log(macs);
  runMacro(macs);
  send("running", JSON.stringify({ running, paused }));
});

ipcMain.on("off", (e, pl) => {
  let mac = JSON.parse(pl);
  if (running[mac.id]) {
    worker.postMessage({ keycode: mac.keycode, type: mac.type });
    running[mac.id] = 0;
    paused[mac.id] = 0;
    send("running", JSON.stringify({ running, paused }));
    return;
  }
});

ipcMain.on("halt", (e, pl) => {
  running[pl] = 0;
  // console.log("aeasfvznsjfordfdjg;kcbnfjlsnfksorjgdkslejgdlskejglsjgkekgjlsmvfjsd");
});

ipcMain.on("save", (e, payload) => {
  if (payload.length < 4) return;
  console.log("saving:", payload);
  let json = JSON.parse(payload);

  Object.keys(json).forEach((e) => {
    let arr = [global.data];
    let spl = e.split(".");

    spl.forEach((el, i) => {
      // arr[i][el] ??= {};
      arr[i + 1] = arr[i][el];
    });

    if (spl.at(-1) == "$") delete arr.at(-3)[spl.at(-2)];
    else arr.at(-2)[spl.at(-1)] = json[e];
  });

  fs.writeFile(`${global.app.getPath("userData")}/lo-macro.json`, JSON.stringify(global.data), (e) => {});
  e.reply("reply", "saved");
});

ipcMain.on("load", (e, payload) => {
  // console.log('loading', JSON.stringify(macros));
  send = e.reply;
  global.send = e.reply;
  send("load", JSON.stringify({ macros, sets }));
});

// setInterval(e => console.log(robot.getMousePos()), 1000)
// 52.39309347734619
// 55.63328882419987
//#endregion

let port = 23239;

let server = ex.listen(port, () => {
  let port = server.address().port;
  console.log(`server started on ${port}`);
});
