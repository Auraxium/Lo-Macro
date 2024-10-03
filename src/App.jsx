import { useState, useEffect, useRef } from 'react'
import Create from './Create'
import Home from './home'

window.macros_bc = {};
let g = {}
window.g = g;
window.send = window.ipc.send;

window.addEventListener('beforeunload', e => send('save', JSON.stringify(macros_bc)))

function App() {
	const [view, setView] = useState(<Home />)

	useEffect(() => {
		window.setView = setView;
	}, [])

	return (
		<div className="center h-[100svh] w-full">
			<div className="border w-[800px] h-[80%]">{view}</div>
		</div>
	)
}

export default App