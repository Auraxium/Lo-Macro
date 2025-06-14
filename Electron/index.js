const { app, BrowserWindow, screen } = require("electron");
global.app = app;
const path = require("node:path");
const fs = require("fs").promises;

let port = 'http://localhost:3009/';
let url = 'https://misc.auraxium.dev/macro/';

async function main() {
  console.log(`${app.getPath('userData')}/lo-macro.json`);
  
  global.data = await fs.readFile(`${app.getPath('userData')}/lo-macro.json`).then(res => JSON.parse(res)).catch(() => ({
    macros: {},
    sets: {},
    config: { w: 980, h: 720, x: screen.getPrimaryDisplay().size.width / 2 - 490, y: screen.getPrimaryDisplay().size.height / 2 - 360, max: 0 }
  }));
 
  require('./server')

  create()
}

async function create() {
  let { x, y, w, h, max } = global.data.config;

  global.win = new BrowserWindow({
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
    global.data.config = { x, y, w, h, max };
  } 

  win.on('moved', fig)

  win.on('blur', e => {
    fig()
    // console.log('blurr');
    // fs.writeFile(`${app.getPath('userData')}/config.json`, JSON.stringify({ x, y, w, h, max }));
  })

  win.on('close', e => {
    console.log('closing');
    fig()
    fs.writeFile(`${app.getPath('userData')}/lo-macro.json`, JSON.stringify(global.data), e => {});
  })
  
  await fetch(port).then(() => win.loadURL(port)).catch(() => win.loadURL(`file://${path.join(__dirname, './lo-macro/index.html')}`))
  win.webContents.openDevTools();
}

app.on("ready", main);

app.on("window-all-closed", () => {
  // console.log('quitting??');
  app.quit()
});