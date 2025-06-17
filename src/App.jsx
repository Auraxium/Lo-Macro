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
    <div className="center h-[100svh] w-full mainmmm">
      <div className="border w-[800px] h-[80%] overflow-hidden, ">
        {/* <button className="w-12 h-12" onClick={(e) => {
          console.log('getting');
          ipcFetch("test", { ur: "gay" }).then(res => {
            console.log('got:', res);
            e.target.style.color = res
          })
        }}>
          dsrtyl454 myl4kw5mh
        </button> */}
        {view}
      </div>
    </div>
  );
}

export default App;
