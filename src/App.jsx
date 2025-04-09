import { useState, useEffect, useRef } from 'react'
import Create from './Create'
import Home from './home'


function App() {
	const [view, setView] = useState(<Home />)

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