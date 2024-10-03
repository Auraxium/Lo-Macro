const { app, BrowserWindow, screen } = require("electron");
global.app = app;
const path = require("node:path");
const fs = require("fs").promises;
require('./server')

let port = 'http://localhost:3009/';
let url = 'https://misc.auraxium.dev/macro/';

async function create() {
  let { x, y, w, h, max } = await fs.readFile(`${app.getPath('userData')}/config.json`).then(res => JSON.parse(res)).catch(() => ({ w: 980, h: 720, x: screen.getPrimaryDisplay().size.width / 2 - 490, y: screen.getPrimaryDisplay().size.height / 2 - 360, max: 0 }));
  
  let win = new BrowserWindow({
    width: w,
    height: h,
    x: x,
    y: y,
    backgroundColor: "#202020",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (max) win.maximize();

  function fig() {
    max = win.isMaximized();
    [x, y] = win.getPosition();
    if (!max) [w, h] = win.getSize();
  }

  win.on('moved', fig)

  win.on('blur', e => {
    fs.writeFile(`${app.getPath('userData')}/config.json`, JSON.stringify({ x, y, w, h, max }));
  })

  win.on('close', e => {
    fig()
    fs.writeFile(`${app.getPath('userData')}/config.json`, JSON.stringify({ x, y, w, h, max }));
  })

  await app.whenReady();
  await fetch(port).then(() => win.loadURL(port)).catch(() => win.loadFile('join.html'))
  win.webContents.openDevTools();
}

app.on("ready", create);

app.on("window-all-closed", () => {
  app.quit()
});