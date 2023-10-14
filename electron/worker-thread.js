const {parentPort} = require('node:worker_threads');
const { GlobalKeyboardListener } = require("@futpib/node-global-key-listener");
const v = new GlobalKeyboardListener();
const {uIOhook, UiohookKey} = require('uiohook-napi')
const robot = require("@jitsi/robotjs");
let hold_watch = {SPACE: 1}
let hold_save = {SPACE: 0}
let ups = 0;
let ready = true;


parentPort.on('message', m => {
	ready = true;
// robot.keyTap(m);
})

v.addListener((e) => {
  if (e.name == "MINUS") return clear();
	if(!ready) return;
	if(e._raw.split(',')[3][0] == 0) return;
	console.log(e._raw);
	if(!hold_watch[e.name]) return;
  if (e._raw.length > 30) return;

	let state = e.state == 'DOWN' ? 1:0;
	if(hold_save[e.name] != state) {
		hold_save[e.name] = state
		console.log('state change', new Date());         
		ready == false;

		parentPort.postMessage(JSON.stringify({SPACE: state}))
	}

	

  // console.log(e.state == "DOWN" ? 'holding space' : 'let go of space');
 
});

// uIOhook.on('keydown', (e) => {
// 	console.log(e);
//  })
//  uIOhook.start()