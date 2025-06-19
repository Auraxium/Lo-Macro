import { Command } from "@tauri-apps/plugin-shell";
import { isTauri } from "@tauri-apps/api/core";

let command;
export let ipc;

let events = {};
let ons = {};

let tasks = {};

async function runCommand() {
  if (ipc) return ipc;
  if (ipc === 0) {
    while (!ipc) await delay(500);
    return ipc;
  }
  ipc = 0;
  command = null;
  command = new Command("py-spawn", ["py", "main.py"]);
  // command = new Command("node-spawn", ["node", "server.js"]);
  // command = new Command("exe-spawn", ["prod"]);

  command.stdout.on("data", (line) => {
    if (line[0] != "{") return console.log("[stout]", line);
    // console.log("[stdout]", line);
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

  command.stderr.on("data", (line) => {
    console.error("[stderr]", line);
  });

  command.on("close", (data) => {
    console.log("Process exited with code", data.code);
    ipc = null;
  });

  ipc = await command.spawn();
  console.log("new command", command, ipc);
  // ipc.write("ya\n");
  return ipc;
}

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
export async function ipcFetch(p, j={}, nr) {
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
