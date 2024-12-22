import { useState, useEffect, useRef } from 'react'
import { IconArrowNarrowRight, IconReload, IconArrowBigDownLine, IconToggleRight, IconArrowDown, IconArrowUp, IconStopwatch, IconCopy, IconX } from '@tabler/icons-react'
import Home from './Home'

window.p = console.log
window.$ = (s) => {
	let a = [...document.querySelectorAll(s)]
	if (!a.length) return null;
	if (a.length == 1) return a[0]
	return a
}
window.clamp = (n, min, max) => n < min ? min : n > max ? max : n
let move = false;
let l = {};

let ph = document.createElement('div');
ph.id = 'ph';
ph.style.height = '60px'
ph.style.width = '100%'
ph.style.backgroundColor = '#360e0e'

function Create({ edit }) {
	// let nav = useNavigate();
	const [form, setForm] = useState(edit || { type: 'once' });
	const [record, setRecord] = useState(false);
	const [inputs, setInputs] = useState(form.inputs || []);
	let keyi = useRef();
	let tracker = {};
	g.record = record;
	let cont = useRef()

	const Input = ({ input, i }) => {
		let onMove = (e) => {
			if (!move || move++ < 20) return;

			e.currentTarget.style.width = e.currentTarget.clientWidth + 'px';
			$('#bar').style.display = 'flex';
			if ($('#ph')) $('#ph').remove();
			e.currentTarget.style.position = 'fixed';
			e.currentTarget.style.zIndex = '10';

			onMove = (e) => {
				l.tes = clamp(~~((e.pageY - cont.current.offsetTop) / 60), 0, inputs.length - 1)
				$('#bar').style.top = l.tes * 60 + 'px';
				e.currentTarget.style.left = e.pageX - l.x + 'px';
				e.currentTarget.style.top = e.pageY - l.y + 'px';
			}
		}
		//${i % 2 ? 'bg-[#491212]' : 'bg-[#360e0e]'} 
		return (
			<div className={`${i % 2 ? 'bg-[#491212]' : 'bg-[#360e0e]'}  w-full h-[60px] p-1 text-[14px] relative  `}
				onPointerDown={e => {
					e.currentTarget.setPointerCapture(e.pointerId);
					l = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, h: i * 60 };
					move = 1;
				}}
				onPointerMove={e => onMove(e)}
				onPointerUp={e => {
					if(move<20) return;
					$('#bar').style.display = 'none';
					if ($('#ph')) $('#ph').remove();
					if (i != l.tes) {
						inputs.splice(i, 1);
						inputs.splice(l.tes, 0, input);
						console.log([...inputs]);
					}
					l.tes=0;
					if (move >= 20) setInputs(e => [...e]);
					move = 0;
				}}
			>
				<div className="absolute left-[87%] translate-y-[100%] hover:bg-zinc-700 " onClick={e => setInputs(inputs.filter((e, ii) => ii != i))}><IconX size={18} /></div>

				<div className="flex h-1/2 items-center gap-1">
				Key:
					<input
						onPointerDown={e => e.stopPropagation()}
						maxLength={1}
						style={{ all: 'unset', width: '45px' }}
						className='bg-slate-700'
						onFocus={e => e.target.select() }
						onKeyDown={e => {
							let key = e.key == ' ' ? 'space' : e.key;
							e.target.value = key;
							inputs[i].key = key;
							inputs[i].keycode = e.keyCode;
							inputs[i].right = e.location > 1;
						}} 
						defaultValue={input.key || 'delay'}
						 />
				</div>

				<div className="flex h-1/2 relative -left-[4px] items-center">
					<div className="">
						<IconStopwatch size={22} />
					</div>
					:&nbsp;
					<input
						onPointerDown={e => e.stopPropagation()}
						type="text"
						style={{ all: 'unset', width: '45px'}}
						onKeyUp={e => inputs[i].duration = +e.target.value || 0}
						onFocus={e => e.target.select() }
						// onBlur={e => e.target.value = (+input.duration || '-')}
						defaultValue={inputs[i].duration || '-'}

					/>
					<div>ms</div>
				</div>

				<div className=""></div>
			</div>

		)
	}

	function clickDown(e) {
		if (e.target.id == 'record') return;
		if (!g.record) return;
		let key = e.button == 0 ? 'lc' : e.button == 1 ? 'rc' : 'mc';
		if (tracker[key]) return;
		tracker[key] = Date.now();
		setInputs(p => [...p, { key: key }]);
	}

	function keyDown(e) {
		if (g.once) {
			let key = e.key;
			if (key == ' ') key = 'space';
			setInputs(p => [...p, { key: key, right: e.location > 1 }]);
			g.once = false;
		}
		if (!g.record) return;
		let key = e.key;
		if (key == ' ') key = 'space';

		if (tracker[key]) return;
		console.log(key.toLowerCase());
		tracker[key] = Date.now();
		setInputs(p => [...p, { key: key, right: e.location > 1 }]);
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
		form.inputs = [...inputs];
		form.id ??= Math.random().toString(36).slice(2).slice(-7);
		form.duration = form.inputs.reduce((acc, e) => acc+=e.duration||70, 0) + (100*form.inputs.length)
		console.log({...form});
		macros_bc[form.id] = form;
		send('save', JSON.stringify(macros_bc))
		// setMacros(p => ({...p, [form.id]: form }))
		setView(<Home />)
	}

	useEffect(() => {
		window.addEventListener('keydown', keyDown);
		window.addEventListener('keyup', keyUp);
		// window.addEventListener('mousedown', clickDown)

		// console.log('is create duping??')

		return () => {
			window.removeEventListener('keydown', keyDown);
			window.removeEventListener('keyup', keyUp);
			// window.removeEventListener('mousedown', clickDown)
		}
	}, [])

	useEffect(() => {
		keyi.current.style.fontSize = `${25 - keyi.current.value.length * 1.85}px`
	})

	return (
		<div className="flex h-full w-full ">

			<div className="absolute laa hidden">
				<input type="text" className='text-black' onKeyDown={e => {
					if (e.key != 'Enter') return;
					console.log(e.target.value);
					setInputs(p => [...p, { key: 'delay', delay: +e.target.value, down: true }]);
					document.querySelector('.laa').style.display = 'none'
				}} />
			</div>

			<div className="w-[20%] border-e flex flex-col items-center ">
				<div className="text-neutral-400  ">Inputs</div>
				<div className="flex &>*:[]">
					<div>add |</div>
					<div onClick={e => setInputs(p => [...p, { key: 'delay', delay: 1 }])} >&nbsp;delay</div>
				</div>
				<hr className="w-[50%] mb-1" />
				<div ref={cont} className="overflow-x-hidden odd:[&>*]:bg-[#360e0e], even:[&>*]:bg-[#491212], w-full  relative ">
					{inputs.map((e, i) => <Input input={e} i={i} />)}
					<div id="bar" className="absolute w-full border-y border-cyan-500 z-[2] " style={{ display: 'none' }} ></div>
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
								if (e.key == 'Escape') return e.target.value = '';
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
						<div className="rounded-md cursor-pointer p-2 bg-neutral-700 hover:bg-neutral-600 center w-[120px] aspect-[1/.4]  " onClick={e => setView(<Home />)}>Cancel</div>
						<div className="rounded-md cursor-pointer p-2 bg-neutral-700 hover:bg-neutral-600 center w-[120px] aspect-[1/.4]  " onClick={e => console.log(inputs)}>Log</div>
						<div className="rounded-md cursor-pointer p-2 bg-teal-700 hover:bg-teal-600 center w-[120px] aspect-[1/.54]  " onClick={Submit} >Save</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Create