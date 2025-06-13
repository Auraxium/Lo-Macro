import { useState, useEffect, useRef } from 'react'
// import Home from './Home'
import { invoke } from "@tauri-apps/api/core";

console.log('jkfx')
function App() {
	const [view, setView] = useState(0)

	useEffect(() => {
		window.setView = setView;
	}, [])

	return (
		<div className="center h-[100svh] w-full">
			<div className="border w-[800px] h-[80%] overflow-hidden, ">{view}</div>
		</div>
	)
}

export default App