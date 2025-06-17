import { Command } from "@tauri-apps/plugin-shell";
import { isTauri } from "@tauri-apps/api/core";

// window.macros_bc = {};
// window.sets = {};
// window.running = {};
// window.paused = {};
// window.hard_pause = false;

// window.pausa = (id) => {
//   return paused[id] || hard_pause
// }

// let g = {};
// window.g = g;
// window.styles = {
//   accept: 'rounded-md cursor-pointer p-2 bg-teal-700 hover:bg-teal-600'
// }
// window.send = window.ipc.send;

async function runCommand() {
  if (ipc) return ipc;
  if (ipc === 0) {
    while (!ipc) await delay(500);
    return ipc;
  }
  ipc = 0;
  command = null;
  command = new Command("spawner", ["node", "server.js"]);
  // command = new Command("server-win", ["prod"]);

// window.ipc.on('load', (e) => {
//   if (!e) return console.log('no macas');
//   let data = JSON.parse(e);
//   console.log('data:', {...data});
//   macros_bc = data.macros || {}
//   sets = data.sets || {}
//   if(window.setMacros) setMacros({ ...macros_bc });
// })

// window.ipc.on('running', (e) => {
//   if(e=='{}') hard_pause = 0
//   let t = JSON.parse(e)
//   running = t.running || {};
//   paused = t.paused || {};
//   // console.log('got running:', t);
//   if(window.refresh) refresh(Math.random())
// })

// window.ipc.on('reflow', (e) => {
// 	window.reflow(document.querySelector(`[inp="${e}"]`), macros_bc[e].duration);
// })

// window.ipc.on('pausa', (e) => {
//   // console.log(e);
// 	window.hard_pause = e
//   window.refresh()
// })

if (!isTauri()) {
  console.log("no command");

  runCommand = async () => {
    if (ipc?.write) return ipc;
    if (ipc === 0) {
      while (!ipc) await delay(500);
      return ipc;
    }
    ipc = 0;
    let ws = new WebSocket("ws://localhost:23239");
    let k = new Promise((y, n) => {
      ws.addEventListener("open", () => {
        console.log("Connected to server");
        ipc = { write: (s) => ws.send(s) };
        y(ipc);
      });

      ws.addEventListener("message", (event) => {
        let line = event.data;
        if (line[0] != "{") return console.log("[stout]", line);
        let data;
        try {
          data = JSON.parse(line);
        } catch (e) {}
        if (!data) return;
        if (events[data.event]) events[data.event]();
        if (tasks[data.uid]) {
          if (data.err) tasks[data.uid].n(data.err);
          else tasks[data.uid].y(data.res);
          delete tasks[data.uid];
        }
      });

      ws.addEventListener("close", () => {
        console.log("Disconnected from server");
        ipc = null;
        n("");
      });
    });
    return k;
  };
}

if (!ipc) runCommand();

let c = 1;
export async function ipcFetch(p, j, nr) {
  if (typeof (ipc?.write || {}) != "function") await runCommand();
  j.port ??= p;
  if (nr) return ipc.write(JSON.stringify(j) + "\n");
  j.uid = c++;
  let k = new Promise((y, n) => {
    tasks[j.uid] = { y, n };
  });
  ipc.write(JSON.stringify(j) + "\n");
  return k;
}

export function delay(secs = 1000) {
  return new Promise((y, n) => setTimeout(() => y(""), secs));
}

document.addEventListener("beforeunload", (e) => {
  ipc.kill();
  ipc = null;
});
