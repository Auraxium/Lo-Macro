const {parentPort} = require('node:worker_threads');
const { GlobalKeyboardListener } = require("@futpib/node-global-key-listener");
const v = new GlobalKeyboardListener();
let hold_watch = {}
let hold_save = {}

parentPort.on('message', m => {
	hold_watch[m] = 1;
})

v.addListener((e) => {
  if (e.name == "MINUS") parentPort.postMessage('clear');
	// console.log(e);
	if(!hold_watch[e.vKey]) return;
	if(e._raw.split(',')[3][0] == 0) return;

	let state = e.state == 'DOWN' ? 1:0;
	if(hold_save[e.vKey] != state) {
		hold_save[e.vKey] = state
		// console.log('state change', state,  new Date());     
		parentPort.postMessage(JSON.stringify({[e.vKey]: state}))
	}
});