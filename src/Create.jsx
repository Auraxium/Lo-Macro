import {useState, useEffect, useRef} from 'react'
import {IconArrowNarrowRight, IconReload, IconArrowBigDownLine, IconToggleRight, IconArrowDown,  IconCopy  } from '@tabler/icons-react'
import Home from './Home'

window.p = console.log

function Create({edit}) {
	// let nav = useNavigate();
	const [form, setForm] = useState(edit || { type: 'once' })
	const [record, setRecord] = useState(false)
	const [inputs, setInputs] = useState(form.inputs || [])
	let keyi = useRef()
	let tracker = {};
	g.record = record;

	const Input = ({ input }) => {

		return (
			<div className="w-full h-[60px] p-1 text-[14px] ">
				<div className="flex h-1/2 items-center">Key: {input.key} {input.down ? <IconArrowDown size={14} /> : <IconArrowUp size={14} />}</div>
				<div className="flex h-1/2 items-center">Delay: {input.delay ? `${input.delay} ms` : '-'}</div>
			</div>
		)
	}

	function clickDown(e) {
		if(e.target.id == 'record') return;
		if (!g.record) return;
		let key = e.button == 0 ? 'lc' : e.button == 1 ? 'rc' : 'mc';
		if (tracker[key]) return;
		tracker[key] = Date.now();
		setInputs(p => [...p, { key: key, down: true }]);
	}

	function keyDown(e) {
		if (!g.record) return;
		let key = e.key;
		if (key == ' ') key = 'space';
		if (tracker[key]) return;
		console.log(key.toLowerCase());
		tracker[key] = Date.now();
		setInputs(p => [...p, { key: key, down: true }]);
	}

	function keyUp(e) {
		if (!g.record) return;
		let key = e.key;
		if (key == ' ') key = 'space';
		if (!tracker[key]) return;
		let k = (Date.now() - tracker[key]);
		tracker[key] = 0;
		// setInputs(p => [...p, {key: e.key, down: false, delay: k}])
	}

	function Submit() {
		form.inputs = inputs;
		form.delay = 200;
		form.id ??= Math.random().toString(36).slice(2).slice(-7);
		console.log(form);
		macros_bc[form.id] = form;
		send('save', JSON.stringify(macros_bc))
		// setMacros(p => [...p, form])
		setView(<Home/>)
	}

	useEffect(() => {
		window.addEventListener('keydown', keyDown);
		window.addEventListener('keyup', keyUp);
		window.addEventListener('mousedown', clickDown)

		console.log('is create duping??')

		return () => {
			window.removeEventListener('keydown', keyDown);
			window.removeEventListener('keyup', keyUp);
			window.removeEventListener('mousedown', clickDown)
	}
	}, [])

	useEffect(() => {
		keyi.current.style.fontSize = `${25 - keyi.current.value.length * 1.85}px`
	})

	return (
		<div className="flex h-full w-full ">

			<div className="w-[20%] border-e flex flex-col items-center ">
				<div className="text-neutral-400  ">Inputs</div>
				<hr className="w-[50%] mb-1" />
				<div className="overflow-scroll w-full odd:[&>*]:bg-[#360e0e] even:[&>*]:bg-[#491212] ">
					{inputs.map(e => <Input input={e} />)}
				</div>
			</div>

			<div className="center grow">
				<div className="flex flex-col gap-y-2 p-2 justify-center w-[75%] h-content rounded-xl bg-neutral-800">
					<div className="flex gap-x-2 w-full">
						<input type="text" className="rounded-md grow text-center bg-neutral-600 self-center h-[45px] p-2 text-[24px] opacity-80 " placeholder='Name' defaultValue={form.name || ''} onChange={e => form.name = e.target.value} />
						<input ref={keyi} type="text" className="rounded-md w-[15%] text-center bg-neutral-600 self-center h-[45px] p-1 text-[24px] opacity-80 " maxLength={1} defaultValue={form.key || ''} 
							autoCapitalize={'words'} 
							placeholder='Key'
							onClick={e => {
								e.preventDefault();
								console.log('left click')
								let key = 'LEFT CLICK'
								e.target.style.fontSize = `${11}px`;
								e.target.value = key;
								form.key = 'lc';
								form.keycode = 0;
							}}
							onKeyDown={e => {
								e.preventDefault();
								console.log(e.key)
								if(e.key == 'Escape') return e.target.value = '';
								let key = (e.key == ' ' ? 'SPACE' : e.key).toUpperCase();
								e.target.style.fontSize = `${25 - key.length * 1.85}px`;
								e.target.value = key;
								form.key = key;
								form.keycode = e.keyCode;
							}}
							/>
					</div>

					<div className="flex  justify-center gap-x-7">
						<div className={`w-[110px] aspect-[1/.9] cursor-pointer bg-neutral-600 rounded-md center flex-col ${form.type == 'once' ? 'border-[2px] border-teal-700' : 'opacity-100'}  hover:opacity-100 `}
							onMouseDown={e => setForm({ ...form, type: 'once' })} >
							<IconArrowNarrowRight size={32} />
							<div className="">Once</div>
						</div>
						<div className={`w-[110px] aspect-[1/.9] cursor-pointer bg-neutral-600 rounded-md center flex-col ${form.type == 'hold' ? 'border-[2px] border-teal-700' : 'opacity-100 '} hover:opacity-100 `}
							onMouseDown={e => setForm({ ...form, type: 'hold' })} >
							<IconArrowBigDownLine size={32} />
							<div className="">Hold</div>
						</div>
						<div className={`w-[110px] aspect-[1/.9] cursor-pointer bg-neutral-600 rounded-md center flex-col ${form.type == 'toggle' ? 'border-[2px] border-teal-700' : 'opacity-100 '} hover:opacity-100 `}
							onMouseDown={e => setForm({ ...form, type: 'toggle' })} >
							<IconToggleRight size={32} />
							<div className="">Toggle</div>
						</div>
						<div className={`w-[110px] aspect-[1/.9] cursor-pointer bg-neutral-600 rounded-md center flex-col ${form.type == 'bind' ? 'border-[2px] border-teal-700' : 'opacity-100'}  hover:opacity-100 `}
							onMouseDown={e => setForm({ ...form, type: 'bind' })} >
							<IconCopy size={32} />
							<div className="">Bind</div>
						</div>
					</div>

					<div id='record' className={`rounded-md cursor-pointer m,y-[30px] center flex-col border-[2px] border-red-800 ${record && 'bg-red-800'} 
					ho,ver:bg-red-800 w-[50%] aspect-[1/.55] place-self-center [&>*]:pointer-events-none `} 
						onClick={e => setRecord(p => !p)} 
					>
						{!record ?
							<>
								<div className="flex center ">
									<div className="rounded-full w-[11px] aspect-[1/1] bg-red-800 " />
									<div className="mx-2 w-content ">Record</div>
									<div className="w-[11px]" />
								</div>
							</>
							:
							<>
								<div className="rounded-full w-[11px] aspect-[1/1] bg-red-800 " />
								<div className="ms-2">Recording...</div>
								<div className="w-[11px]" />
								<div className=" opacity-80 ">Click to stop</div>
							</>
						}
					</div>

					<div className="flex w-full justify-center gap-x-5  ">
						<div className="rounded-md cursor-pointer p-2 bg-neutral-700 hover:bg-neutral-600 center w-[120px] aspect-[1/.4]  " onClick={e => setView(<Home/>)}>Cancel</div>
						<div className="rounded-md cursor-pointer p-2 bg-teal-700 hover:bg-teal-600 center w-[120px] aspect-[1/.54]  " onClick={Submit} >Save</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Create