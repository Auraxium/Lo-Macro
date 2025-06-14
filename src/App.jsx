import { useState, useEffect, useRef } from 'react'
import Home from './Home'
import { invoke } from "@tauri-apps/api/core";
console.log(456);

function App() {
	const [view, setView] = useState('')

	useEffect(() => {
		window.setView = setView;
	}, [])

	return (
		<div className="center h-[100svh] w-full">
			<div className="border w-[800px] h-[80%] overflow-hidden, ">{view}</div>
			<button onClick={e => ws.emit('createMessage', 'ur gay')} >asug6hhhdf</button>
		</div>
	)
}

export default App