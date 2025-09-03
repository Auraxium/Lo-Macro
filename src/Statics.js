import { Command } from "@tauri-apps/plugin-shell";

// export let global = {};
export let version = 0.1;             
export let states = {};
export let styles = {
  button: 'rounded-sm center cursor-pointer p-2'
};

export let macros = {};
export let sets = {};
export let actives = {active: {}, running: {}}
let data = JSON.parse(localStorage.getItem('data') || '{}');
macros = data.macros || macros;
sets = data.sets || sets;
window.tasks ??= {};

let events = {
  'active': e => {
    actives.active = Object.fromEntries(e.data.active.map(k => [k, 1]));
    actives.running = Object.fromEntries(e.data.running.map(k => [k, 1]));    
    // console.log(actives, states.setActive);
    states.setActive({ ...actives });
  },
  'line': e => {
    // console.log(e)
    document.dispatchEvent(new CustomEvent('RecordLine', {detail: e.line}))
  }
};

export function delay(secs = 1000) {
  return new Promise((y, n) => setTimeout(() => y(""), secs));
}

export function clamp(min, val, max) {
  return Math.max(min, Math.min(val, max));
}

export const debounce = function (cb, delay = 400, timeout) {

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
};

export function uid(l = 7) {
  return Math.random().toString(27).slice(2, l + 2)
}

export function save() {
  localStorage.setItem('data', JSON.stringify({ macros, sets }))
}

export async function init() {
  while (!window.pyspawn) await delay(400) // runCommand();
  let res = await ipcFetch("load");
  let data = JSON.parse(localStorage.getItem('data') || '{}');
  macros = data.macros || macros;
  sets = data.sets || sets;
  return macros;
}

async function runCommand(s) {
  if (window.pyspawn?.write) return window.pyspawn;
  if (window.pyspawn === 0) {
    while (!window.pyspawn) await delay(400);
    return window.pyspawn;
  }
  window.pyspawn?.kill && window.pyspawn.kill();
  window.pyspawn = 0;
  if (!window.command) {
    window.command = new Command("py-spawn", ["py", "main.py"]);
    // window.command = new Command("exe-spawn", ["prod"]);

    window.command.stdout.on("data", (line) => {
      // if(document.querySelector('.msg')) document.querySelector('.msg').innerHTML = line;
      if (line[0] != "{") return console.log("[stout]", line);
      let data;
      try {
        data = JSON.parse(line);
        if (!data) return console.log("[stout]", line);
        // console.log(data)
        if (events[data.event]) return events[data.event](data);
        if (tasks[data.uid]) {
          if (data.err) tasks[data.uid].n(data);
          else tasks[data.uid].y(data.res);
          delete tasks[data.uid];
        }
        if (!data.uid && !data.event) return console.log(data);
      } catch (err) { console.error(err); console.log('err cause:', line) }
    });

    window.command.stderr.on("data", (line) => {
      // if(document.querySelector('.msg')) document.querySelector('.msg').innerHTML = line;
      console.error("[stderr]", line);
    });

    window.command.on("close", (data) => {
      if(document.querySelector('.msg')) document.querySelector('.msg').innerHTML = 'closed'
      console.log("Process exited with code", data.code);
      window.pyspawn?.kill && window.pyspawn.kill();
      window.pyspawn = null;
    });
  }

  window.pyspawn?.kill && window.pyspawn.kill();
  window.pyspawn = null;
  window.pyspawn = await window.command.spawn();
  console.log("new command", window.command, window.pyspawn, s);
  return window.pyspawn;
}

if (!window.pyspawn?.write) runCommand('raw');

let c = 1;
export async function ipcFetch(p, j = {}, nr) {
  if (typeof (!window.pyspawn || {}) != "function") await runCommand('fetch');
  j.port ??= p;
  if (nr) return window.pyspawn.write(JSON.stringify(j) + "\n");
  j.uid = c++;
  let k = new Promise((y, n) => {
    tasks[j.uid] = { y, n };
  });

  window.pyspawn.write(JSON.stringify(j) + "\n");
  return k;
}

window.addEventListener('beforeunload', () => {
  localStorage.setItem('data', JSON.stringify({ macros, sets }))
})