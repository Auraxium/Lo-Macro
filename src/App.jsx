import { useState, useEffect, useRef, createContext } from "react";
import { states, ipcFetch, init, delay, styles, macros, uid, save, version, actives } from './Statics';
import { IconArrowNarrowRight, IconArrowBigDownLine, IconRefresh, IconToggleRight, IconCopy, IconStopwatch, IconX, IconArrowNarrowUp, IconArrowNarrowDown, IconPencil, IconTrash, IconPlus } from "@tabler/icons-react";

let size = 28;
let type_icon_map = {
  'once': <IconArrowNarrowRight size={size} />,
  'hold': <IconArrowBigDownLine size={size} />,
  'loop': <IconRefresh size={size} />,
  'toggle': <IconToggleRight size={size} />,
  'bind': <IconCopy size={size} />,
}

function Home() {
  let [macros_stat, setMacros] = useState({ ...macros });
  let [mac_states, setActive] = useState(actives);

  useEffect(() => {
    states.setMacros = setMacros;
    states.setActive = setActive;
    // console.log('???')
  }, [])

  const Macro = ({ mac }) => {

    return (
      <div className={`w-full h-[75px] py-2 px-4 flex border-b-[1px] relative ${mac_states.active[mac.id] ? 'bg-teal-900 hover:bg-teal-800' : 'bg-[#303030] hover:bg-[#444]'} border-[#444] `} onClick={() => {
        ipcFetch('activate', { id: mac.id, mac }, 1)
      }}>
        <div className="absolute bottom-0 flex items-center gap-1 text-[#888] ">
          {mac.inputs.filter(e => e.down).map((e, i, arr) => <><div key={1} className="capitalize">{e.key}</div> {i + 1 == arr.length ? '' : <IconArrowNarrowRight size={20} />}</>)}
        </div>
        <div className="w-[20%] flex items-center,">
          {type_icon_map[mac.type]} &nbsp; "<b>{mac.activate}</b>"
        </div>
        <div className="grow center text-[22px] font-light,">
          {mac.name}
        </div>
        <div className="w-[20%] flex justify-around items-center" onClick={e => e.stopPropagation()}>
          <div className="p-1" onClick={() => states.setView(<Create edit={{ ...mac }} />)}><IconPencil /></div>
          <div className="p-1" onClick={() => { delete macros[mac.id]; save(); setMacros({ ...macros }) }} ><IconTrash /></div>
        </div>
      </div>
    )
  }

  return (
    <div className="full col">
      <div className="h-[7%] p-1 border-b-[1px] flex gap-1 items-center">
        <div onClick={() => states.setView(<Create />)} className={`${styles.button} hover:bg-teal-600 h-full flex items-center w-[content] bg-teal-700`}> <IconPlus /> New Macro</div>
        <div className="msg"></div>
        {/* <div onClick={() => ipcFetch('test').then(console.log)} className={`${styles.button}  h-full flex items-center w-[content] `}> <IconPlus /> Test</div> */}
      </div>
      <div className="grow h-1 w-full overflow-y-auto">
        {Object.values(macros).map(mac => <Macro key={mac.id} mac={mac} />)}
      </div>
    </div>
  )
}

let recording;
let key_track = {};
let bad_case = {
  16: {
    0: 'shiftleft',
    2: 'shiftleft',
  },
  17: {
    0: 'ctrlleft',
    1: 'ctrlleft',
    2: 'ctrlright',
    3: 'ctrlright'
  },
  18: {
    0: 'altleft',
    2: 'altright'
  },
  'left': 'leftclick',
  'right': 'rightclick',
  'middle': 'middleclick'
}
let down_map = new Set(['0', '2']);

function Create({ edit }) {
  let [form, setForm] = useState(edit && { ...edit } || { type: 'once' });
  let [inputs, setInputs] = useState(form.inputs || []);
  let [binds, setBinds] = useState(form.binds || []);
  let inputs_ref = useRef();
  let move_bar = useRef();
  let refresh = () => setInputs([...inputs]);
  recording = form.recording; // convienent
  // if(!inputs.length)
  // console.log(inputs)

  useEffect(() => {
    function keyDown(e) {
      console.log(e)
      // if (!recording) return;
      // let key = (bad_case[e.keyCode]?.[e.location] || (e.location && e?.code) || e.key)
      // if (key_track[key]) return;
      // console.log(e.key, String.fromCharCode(e.keyCode), e, );
      // setInputs(p => {
      //   key_track[key] = {
      //     date: Date.now(),
      //     pos: p.length
      //   }
      //   return [...p, { down: null, key: key, keycode: e.keyCode }];
      // });
    }

    function keyUp(e) {
      if (!recording) return;
      let key = (bad_case[e.keyCode]?.[e.location] || ((e.location) && e.code.toLowerCase()) || e.key).toLowerCase();
      if (!key_track[key]) return;
      let temp = { ...key_track[key] }
      delete key_track[key];
      setInputs(p => {
        (p[temp.pos] || {}).down = Date.now() - temp.date;
        // return [...p, { down: 0, key: key, keycode: e.keyCode }];
        return [...p];
      })
    }

    function handleLine({ detail }) {
      // console.log(detail);
      let spl = detail.split(',');
      let code = +spl[0];
      let mouse = !code;
      let key = spl[1].toLowerCase();
      let down = spl[2] != 'up';
      if (!recording) return;
      if (down) {
        if (key_track[key]) return;
        setInputs(p => {
          key_track[key] = {
            date: Date.now(),
            pos: p.length
          }
          let js = { down: null, key: key, keycode: code }
          if (mouse) js = { ...js, mouse: 1, pos: spl[3].split('|') }
          return [...p, js];
        });
      } else {
        let temp = { ...key_track[key] }
        delete key_track[key];
        setInputs(p => {
          (p[temp.pos] || {}).down = Date.now() - temp.date;
          // return [...p, { down: 0, key: key, keycode: e.keyCode }];
          return [...p];
        })
      }
    }

    // window.addEventListener('keydown', keyDown);
    // window.addEventListener('keyup', keyUp);
    document.addEventListener('RecordLine', handleLine);
    // ipcFetch('record', { recording: true }, 1)

    return () => {
      recording = false;
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
      document.removeEventListener('RecordLine', handleLine);
      ipcFetch('record', { recording: false }, 1)
    }
  }, [])

  const TypeCard = ({ type }) => (
    <div className={`w-[80px] aspect-square, center rounded-md bg-[#5c5c5c] ${form.type == type ? 'border-[2px] border-teal-700 box-border ' : ''} col items-center p-1 cursor-pointer pen  `} onClick={() => setForm(p => ({ ...p, type }))} >
      {type_icon_map[type]}
      <span className="capitalize text-[16px] ">{type}</span>
    </div>
  )

  const Editable = ({ cb, defaultEle, defaultVal, i, format, onchange, ondown, className, input_classname, default_classname }) => {
    let [editing, setEditing] = useState(0);
    let inp = useRef()

    useEffect(() => {
      if (inp.current?.focus) inp.current.focus()

    })

    return (
      <div className={` ${className}`}>
        {editing ?
          <input ref={inp} className={`w-8 h-8 border-[1px] border-amber-300 ${input_classname}`}
            type="text"
            defaultValue={defaultVal}
            onKeyDown={e => { ondown && ondown(e.target.value, e); e.key == 'Enter' && e.target.blur() }}
            onKeyUp={e => onchange && onchange(e.target.value, e)}
            onBlur={(e) => { cb && cb(e.target.value); setEditing(0) }}
            onFocus={e => e.target.select()}
          />
          :
          <div className={` ${default_classname}`} onClick={() => setEditing(1)}>{defaultEle || defaultVal || 'ndll'}</div>
        }
      </div>
    )
  }

  const Input = ({ data, i }) => {
    let el = inputs[i];

    useEffect(() => {
      if (!data.edit) return;
      delete inputs[i].edit;
      let ele = document.querySelector('.edit')
      if (!ele?.focus) return;
      ele.focus();
      ele.select();
    })

    let main = (() => {
      if ('delay' in data) return (
        <div className="flex items-center text-[13px]">Delay: &nbsp;
          {data.edit ?
            <div className=" max-h-[9px], center " >
              <input className="edit max-h-[16px] h-full, max-w-[65px] " defaultValue={data.delay} onKeyDown={e => e.key == 'Enter' && e.target.blur()} onBlur={(e) => { el.delay = parseInt(e.target.value) || 1000; refresh() }} />
            </div>
            :
            <span onClick={() => { el.edit = 1; refresh() }}>{data.delay}ms</span>
          }
        </div>
      )
      if (form.type == 'bind') {
        return (
          <div className="col center h-12 ">
            <Editable defaultVal={data.key} cb={(val) => { setBinds([...binds]) }} ondown={(val, e) => {
              if (val == 'Enter') return; //but cant make val enter
              e.preventDefault();
              e.key = (bad_case[e.keyCode]?.[e.location] || ((e.location) && e.code.toLowerCase()) || e.key).toLowerCase();
              e.target.value = e.key;
              binds[i].key = e.key;
              binds[i].keycode = e.keyCode;
            }} />
            <Editable defaultVal={data.binds.join("")} cb={(val) => {
              binds[i].binds = val.toLowerCase().split('').filter(Boolean);
              setBinds([...binds])
            }} />
          </div>
        )
      }
      if ('mouse' in data) {
        return (
          <div className="col w-full justify-center ">
            <div className="flex">
              {data.key}&nbsp;{data.down == 0 ? <IconArrowNarrowUp size={18} /> : <IconArrowNarrowDown size={18} />}&nbsp;{data.down || ''}
            </div>
            <div className="">x: {data.pos[0]} y:{data.pos[1]}</div>
          </div>
        )
      }
      return (<div className="flex items-center">
        {data.key}&nbsp;{data.down == 0 ? <IconArrowNarrowUp size={18} /> : <IconArrowNarrowDown size={18} />}&nbsp;{data.down || ''}
      </div>)
    })()

    return (
      <div className={`input ${i % 2 ? 'bg-[#491212]' : 'bg-[#360e0e]'} border-b-[1px], relative col box-border, px-1 py-2 capitalize`} data-ind={i}>
        <div className="absolute border, right-[3px] top-[31%] " onClick={() => form.type == 'bind' ? setBinds(p => p.filter((_, ind) => ind != i)) : setInputs(p => [...p.filter((e, ind) => ind != i)]) } ><IconX size={18} /></div>
        <div className="absolute border, -top-[0px] -left-[2px] w-[12%] h-full cursor-grab " onClick={(e) => e.stopPropagation()} onPointerDown={(e) => {
          e.target.parentNode.style.opacity = 0.4;
          window.prev = e.target.parentNode.dataset.ind;
          let cont = document.querySelector('.input-container');
          // cont.innerHTML += `<div class="input border" style="height: 40px; width: 100%; border: solid 1px white" ></div>`;
          const onup = () => {
            document.removeEventListener('pointerup', onup)
            move_bar.current.style.display = 'none';
            setInputs(p => {
              let input = inputs[window.prev]
              p.splice(window.prev, 1);
              if (window.prev < window.ind) window.ind++
              p.splice(window.ind, 0, input);
              return [...p]
            })
          }
          document.addEventListener('pointerup', onup);
          [...document.querySelectorAll('.input')].forEach(e => e.addEventListener('pointerenter', e => {
            window.ind = +e.target.dataset.ind;
            move_bar.current.style.display = 'flex';
            move_bar.current.style.top = `${e.target.getBoundingClientRect().top - 2}px`
          }));
        }} />
        {main}
      </div>
    )
  }

  return (
    <div className="full flex ">
      <div className="w-[25%] border-e-[1px] col  ">
        <div ref={move_bar} className="fixed z-10 hidden w-[15.5%] h-1 bg-[#22b37b]"></div>
        <span className="center text-zinc-500">Inputs</span>
        <div className="center flex gap-1">
          <div className="" onClick={e => {
            form.recording = 0;
            form.type == 'bind' ? binds.push({ key: '', binds: [] }) : inputs.push({})
            setBinds([...binds]);
          }}>add</div>
          |
          <div className="delay" onClick={() => {
            inputs.push({ delay: 0, edit: 1 });
            form.recording = 0;
            setInputs([...inputs]);
          }}>delay</div>
        </div>
        <hr className="mx-[17%] text-zinc-400 mb-1" />
        <div ref={inputs_ref} className="input-container grow h-1 overflow-x-hidden overflow-y-auto text-[14px] relative ">
          {form.type == 'bind' ? binds.map((bind, i) => <Input key={i} i={i} data={bind} />) : inputs.map((input, i) => <Input key={i} i={i} data={input} />)}
        </div>
      </div>

      <div className="grow w-1 center ">
        <div className="w-[90%] rounded-lg bg-[#333333] p-2 col gap-2">
          <div className="flex gap-1 text-[22px]">
            <input className="grow rounded-md bg-[#4b4b4b] h-[40px] text-center p-1  " type="text" placeholder="Name" onKeyUp={e => form.name = e.target.value} defaultValue={form.name || ''} />
            <input className="w-[80px] rounded-md bg-[#4b4b4b] text-center capitalize" type="text" placeholder="Key" defaultValue={form.activate || ''} maxLength={1}
              style={{ fontSize: `${22 * (1 - (((form.activate || '').length - 1) * .05))}px` }}
              onKeyDown={e => {
                e.preventDefault();
                e.key = e.key.toLowerCase();
                if (e.key == form.activate) e.key = '';
                e.target.style.fontSize = `${22 * (1 - (((e.key || '').length - 1) * .05))}px`;
                e.target.value = e.key;
                form.activate = e.key;
                form.activateCode = e.keyCode;
              }}
            />
          </div>
          <div className="flex gap-3 center">
            <TypeCard type={'once'} />
            <TypeCard type={'hold'} />
            <TypeCard type={'toggle'} />
            |
            <TypeCard type={'bind'} />
          </div>
          <div className=" w-[45%] ms-[27.5%] aspect-[1.9] border-red-800 border-[2px] rounded-md flex center gap-2 cursor-pointer pen" onClick={() => {
            key_track = {};
            if (inputs.at(-1)?.down === null) setInputs(p => [...p].slice(0, -1))
            recording = !recording
            ipcFetch('record', { recording }, 1)
            setForm(p => ({ ...p, recording }));
          }}>
            {form.recording ?
              <div className="bg-red-800 center full">
                Recording
              </div>
              :
              <>
                <div className="bg-red-800 w-[12px] aspect-square rounded-full" />
                <span className="">Record</span>
              </>
            }

          </div>
          <div className="flex justify-center gap-4 w-[75%] ms-[12.5%] [&>*]:flex-[1_0_0%] ">
            <div className={`${styles.button} bg-neutral-600 h-[50px]`} onClick={() => states.setView(<Home />)} >Cancel</div>
            <div className={`${styles.button} bg-neutral-600 h-[50px]`} onClick={() => {
              console.log({ ...form, inputs });
              ipcFetch('test2', {})
            }} >Log</div>
            <div className={`${styles.button} bg-teal-700 h-[50px]`} onClick={() => {
              delete form.recording;
              form.id ??= uid();
              form.inputs = inputs;
              form.binds = binds;
              form.version = version;
              macros[form.id] = { ...form };
              states.setView()
              save()
            }} >Save</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  let [view, setView] = useState('');

  useEffect(() => {
    states.setView = setView;
    init().then(res => setView())

  }, [])

  return (
    <div className="w-[100vw] h-[100vh] bg-[#222] text-[#eee] p-1 center ">
      <div className="  rounded-sm border-[1px] border-[#ccc] w-[40vw] min-w-[600px] h-[80vh]">
        {view ?? <Home />}
      </div>
    </div>
  );
}

export default App;