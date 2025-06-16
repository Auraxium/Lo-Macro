import { useState, useEffect, useRef } from "react";
import Home from "./Home";
import { invoke } from "@tauri-apps/api/core";
import { ipcFetch } from "./statics";

function App() {
  const [view, setView] = useState(<Home />);

  useEffect(() => {
    window.setView = setView;
  }, []);

  return (
    <div className="center h-[100svh] w-full">
      <div className="border w-[800px] h-[80%] overflow-hidden, ">
        <button
          className="w-12 h-12"
          onClick={(e) =>
            ipcFetch("test", { ur: "gay" }).then(
              (res) =>
                (e.target.style.color = `#${Math.floor(Math.random() * 16777215)
                  .toString(16)
                  .toLocaleUpperCase()}`)
            )
          }
        >
          dsrtyl454 myl4kw5mh
        </button>
        {view}
      </div>
    </div>
  );
}

export default App;
