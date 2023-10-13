const {parentPort} = require('node:worker_threads');
const { GlobalKeyboardListener } = require("@futpib/node-global-key-listener");
const v = new GlobalKeyboardListener();
let hold_watch = {SPACE: 1}
let hold_save = {SPACE: 0}

parentPort.on('message', m => {

})

v.addListener((e) => {
  if (e.name == "MINUS") return clear();
  if (e._raw.length > 30) return;
	console.log(e._raw);
	if(!hold_watch[e.name]) return;
	let state = e.state == 'DOWN' ? 1:0;
	if(hold_save[e.name] != state) {
		hold_save[e.name] = state
		// console.log('state change', new Date());
		parentPort.postMessage(JSON.stringify({SPACE: state}))
	}

  // console.log(e.state == "DOWN" ? 'holding space' : 'let go of space');
 
});