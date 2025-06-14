import { useState, useEffect, useRef } from 'react'
import Home from './Home'
import { invoke } from "@tauri-apps/api/core";
import { io } from "socket.io-client";

const ws = io("http://localhost:23239");

// Listen for events from the server
ws.on("connect", () => {
		console.log("Connected to WebSocket server", ws);
});

ws.on("message", (data) => {
		console.log("Message from server:", data);
});

function App() {
	const [view, setView] = useState('')

	useEffect(() => {
		window.setView = setView;
	}, [])

	return (
		<div className="center h-[100svh] w-full">
			<div className="border w-[800px] h-[80%] overflow-hidden, ">{view}</div>
			<button onClick={e => ws.emit('createMessage', 'ur gay')} >asdf</button>
		</div>
	)
}

export default App