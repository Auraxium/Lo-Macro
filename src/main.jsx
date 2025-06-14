import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {ipc} from './statics'
import './index.css'

(async () => {
    while(!ipc) {
        await new Promise((y,n) => setTimeout(() => y(""), 500))
        console.log(ipc);
    } 
})

ReactDOM.createRoot(document.getElementById("root")).render(<App/>,);