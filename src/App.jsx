import { useState, useEffect, useRef } from 'react'
import Create from './Create'
import Home from './home'

document.addEventListener('keydown', e => console.log(e.key, e))

window.macros_bc = {};
window.running = {};
window.paused = {};
window.hard_pause = false;

window.pausa = (id) => {
  return paused[id] || hard_pause
}

let g = {};
window.g = g;
window.styles = {
  accept: 'rounded-md cursor-pointer p-2 bg-teal-700 hover:bg-teal-600'
}
window.send = window.ipc.send;

window.IpcFetch = (p, j = p, cb) => {
  if (!window.ipc) throw new Error('no ipc');
  j.uid ??= uuid(4);
  return new Promise((y, n) => {
		if(!j.nr)
    ipc.on(j.uid, (res) => {
      ipc.off(j.uid); 
      if(res.err) return n({j,...res})
      y(res);
    });
    ipc.send(p.port || p, { ...j })
  });
}

window.ipc.on('load', (e) => {
  if (!e) return console.log('no macas');
  macros_bc = JSON.parse(e);
  if(window.setMacros) setMacros({ ...macros_bc });
})

window.ipc.on('running', (e) => {
  let t = JSON.parse(e)
  running = t.running || {};
  paused = t.paused || {};
  // console.log('got running:', t);
  if(window.refresh) refresh(Math.random())
})

window.addEventListener('beforeunload', e => send('save', JSON.stringify(macros_bc)))

function App() {
	const [view, setView] = useState(<Home />)

	useEffect(() => {
		window.setView = setView;
	}, [])

	return (
		<div className="center h-[100svh] w-full">
			<div className="border w-[800px] h-[80%] overflow-hidden ">{view}</div>
		</div>
	)
}

window.ipc.on('reflow', (e) => {
	window.reflow(document.querySelector(`[inp="${e}"]`), macros_bc[e].duration);
})

window.ipc.on('pausa', (e) => {
	window.hard_pause = !window.hard_pause
  window.refresh()
})

window.reflow = (el, s) => {
  if(!el?.style) return;
  el.style.animation = 'none';
  el.offsetHeight; // triggers reflow
  el.style.animation = `slide ${s}ms linear`; // or your original animation
}

export default App