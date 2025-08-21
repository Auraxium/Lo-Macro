import { Command } from "@tauri-apps/plugin-shell";
import { isTauri } from "@tauri-apps/api/core";

let command;
export let ipc;

let events = {};
let ons = {};

let tasks = {};

export async function init() {
  while (!window.pyspawn) await delay(400) // runCommand();
  let res = await ipcFetch("load");
  perks = res.perks;
  let hold;
  let holds = {};
  let hold_count = 0;
  varsAt = perks.length;
  perks.forEach((e, i) => {
    if (e[0]=='[') char_augs.add(i);
    if (hold && hold == e.slice(0, -3)) {
      plus_map[i] = ++hold_count;
      return;
    } else {
      hold_count = 0;
      hold = 0;
    }
    if (e.at(-2) == "+") {
      hold = e.slice(0, -3).trim();
      holds[hold] = i;
      if (perks[i - 1] == "hold") plus_map[i] = ++hold_count;
      perks.push(hold + " +X");
    }
  });
  window.perks = perks;
  let data = localStorage.getItem('rb_data');
  if(!data || data.length < 15) {
    data = { relics: base_relics}
    localStorage.setItem('rb_data', JSON.stringify(data))
  } else data = JSON.parse(data)
  return data.relics;
}

async function runCommand() {
  if (window.pyspawn?.write) return window.pyspawn;
  if (window.pyspawn === 0) {
    while (!window.pyspawn) await delay(400);
    return window.pyspawn;
  }
  window.pyspawn = 0;
  if (!window.command) {
    // window.command = new Command("py-spawn", ["py", "main.py"]);
    window.command = new Command("exe-spawn", ["prod"]);

    window.command.stdout.on("data", (line) => {
      if (line[0] != "{") return console.log("[stout]", line);
      let data;
      try {
        data = JSON.parse(line);
      } catch (e) {}
      if (!data) return console.log("[stout]", line);
      if (events[data.event]) events[data.event](data);
      if (tasks[data.uid]) {
        if (data.err) tasks[data.uid].n(data.err);
        else tasks[data.uid].y(data.res);
        delete tasks[data.uid];
      }
      if (!data.uid && !data.event) return console.log(data);
    });

    window.command.stderr.on("data", (line) => {
      console.error("[stderr]", line);
    });

    window.command.on("close", (data) => {
      console.log("Process exited with code", data.code);
      window.pyspawn = null;
    });
  }

  window.pyspawn?.kill && window.pyspawn.kill();
  window.pyspawn = null;
  window.pyspawn = await window.command.spawn();
  console.log("new command", window.command, window.pyspawn);
  return window.pyspawn;
}

if (!window.pyspawn?.write) runCommand();

let c = 1;
export async function ipcFetch(p, j = {}, nr) {
  if (typeof (window.pyspawn?.write || {}) != "function") await runCommand();
  j.port ??= p;
  if (nr) return window.pyspawn.write(JSON.stringify(j) + "\n");
  j.uid = c++;
  let k = new Promise((y, n) => {
    tasks[j.uid] = { y, n };
  });

  window.pyspawn.write(JSON.stringify(j) + "\n");
  return k;
}

export function delay(secs = 1000) {
  return new Promise((y, n) => setTimeout(() => y(""), secs));
}

export function clamp(min, val, max) {
  return Math.max(min, Math.min(val, max));
}

export const debounce = function (cb, delay = 400) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
};
document.addEventListener("beforeunload", (e) => {
  ipc.kill();
  ipc = null;
});
