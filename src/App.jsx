import { useState, useEffect, useRef } from 'react'
import Home from './Home'
import { invoke } from "@tauri-apps/api/core";
import { ipcFetch } from './statics';

function App() {
	const [view, setView] = useState('')

	useEffect(() => {
		window.setView = setView;
	}, [])

	return (
		<div className="center h-[100svh] w-full">
			<div className="border w-[800px] h-[80%] overflow-hidden, ">{view}</div>
			<button onClick={e => ipcFetch('test', {q: 'whats my sexuality?'}).then(res => console.log(res))} >asug6hhhdf</button>
		</div>
	)
}

export default App