import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ipcFetch, ipc, delay } from "./statics";
import "./index.css";

(async () => {
  while (!ipc) await delay(500);
  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
})();
