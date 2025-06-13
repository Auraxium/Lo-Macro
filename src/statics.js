// // document.addEventListener('keydown', e => {
// //   console.log(e);
// //   window.refresh()
// // })

// window.macros_bc = {};
// window.sets = {};
// window.running = {};
// window.paused = {};
// window.hard_pause = false;

// window.pausa = (id) => {
//   return paused[id] || hard_pause
// }

// let g = {};
// window.g = g;
// window.styles = {
//   accept: 'rounded-md cursor-pointer p-2 bg-teal-700 hover:bg-teal-600'
// }
// window.send = window.ipc.send;

// window.IpcFetch = (p, j = p, cb) => {
//   if (!window.ipc) throw new Error('no ipc');
//   j.uid ??= uuid(4);
//   return new Promise((y, n) => {
// 		if(!j.nr)
//     ipc.on(j.uid, (res) => {
//       ipc.off(j.uid); 
//       if(res.err) return n({j,...res})
//       y(res);
//     });
//     ipc.send(p.port || p, { ...j })
//   });
// }

// window.ipc.on('load', (e) => {
//   if (!e) return console.log('no macas');
//   let data = JSON.parse(e);
//   console.log('data:', {...data});
//   macros_bc = data.macros || {}
//   sets = data.sets || {}
//   if(window.setMacros) setMacros({ ...macros_bc });
// })

// window.ipc.on('running', (e) => {
//   if(e=='{}') hard_pause = 0
//   let t = JSON.parse(e)
//   running = t.running || {};
//   paused = t.paused || {};
//   // console.log('got running:', t);
//   if(window.refresh) refresh(Math.random())
// })

// window.ipc.on('reflow', (e) => {
// 	window.reflow(document.querySelector(`[inp="${e}"]`), macros_bc[e].duration);
// })

// window.ipc.on('pausa', (e) => {
//   // console.log(e);
// 	window.hard_pause = e
//   window.refresh()
// })

// window.reflow = (el, s) => {
//   if(!el?.style) return;
//   if(s < 1000) return;
//   el.style.animation = 'none';
//   el.offsetHeight; // triggers reflow
//   el.style.animation = `slide ${s}ms linear`; // or your original animation
// }

// window.uid = (l = 7, id='') => {
//   let keys = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
//   while (l-- > -1) id += keys[~~(Math.random() * keys.length)];
//   return id;
// }

// window.$ = (s) => {
//   let a = [...document.querySelectorAll(s)];
//   return !a.length?null:a.length==1?a[0]:a
// }

// // window.addEventListener('beforeunload', e => send('save', JSON.stringify(macros_bc)))