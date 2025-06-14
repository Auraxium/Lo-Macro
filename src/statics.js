import { Command } from "@tauri-apps/plugin-shell";

let command;
let ipc;

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
  command = new Command("spawner", ["node", "server.js"]);

  command.stdout.on("data", (line) => {
    // console.log("[stdout]", line);
    if (line[0] != '{') return;
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
  console.log("new command", ipc);
  ipc.write("ya\n");
  return ipc;
}

if (!ipc) runCommand();

let c = 1;
export async function ipcFetch(p, j, nr) {
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
