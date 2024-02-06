const {contextBridge, ipcRenderer} = require('electron')
const os = require('os')
const path = require('path')
const { electronAPI } = require('@electron-toolkit/preload') 

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
}


// contextBridge.exposeInMainWorld('os', {
// 	homedir: () => os.homedir()
// })

// contextBridge.exposeInMainWorld('path', {
// 	join: (...args) => path.join(...args)
// })

// contextBridge.exposeInMainWorld('ipcRenderer', withPrototype(ipcRenderer))

// // `exposeInMainWorld` can't detect attributes and methods of `prototype`, manually patching it.
// function withPrototype(obj: Record<string, any>) {
//   const protos = Object.getPrototypeOf(obj)

//   for (const [key, value] of Object.entries(protos)) {
//     if (Object.prototype.hasOwnProperty.call(obj, key)) continue

//     if (typeof value === 'function') {
//       // Some native APIs, like `NodeJS.EventEmitter['on']`, don't work in the Renderer process. Wrapping them into a function.
//       obj[key] = function (...args: any) {
//         return value.call(obj, ...args)
//       }
//     } else {
//       obj[key] = value
//     }
//   }
//   return obj
// }