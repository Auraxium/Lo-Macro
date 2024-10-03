import { useState, useRef, useEffect } from 'react'
import {
	IconArrowLeft, IconReload, IconToggleRight, IconArrowNarrowRight,
	IconArrowBigDownLine, IconArrowUp, IconArrowDown, IconSquareRoundedPlus,
	IconTrash, IconPencil, IconCopy,
} from '@tabler/icons-react';
import Create from './Create'

let running = {}
let paused = {}

let icon = {
	once: <IconArrowNarrowRight />,
	hold: <IconArrowBigDownLine />,
	toggle: <IconToggleRight />,
	bind: <IconCopy />,
}

const Macro = ({ macro, ac }) => {
	let [active, setActive] = useState(running[macro.id])
	// active = running[macro.id];

	return (
		<div className={` ${(paused[macro.id] && 'paused ') || (active && ' bg-[#134e4a] ') || ' !bg-neutral-800 hover:!bg-neutral-700 '}  relative flex px-[20px] border-b border-neutral-700 text-[25px] h-[75px]`} onClick={e => {
			console.log(JSON.parse(JSON.stringify(macro)));
			setActive(!active);
			send('run', JSON.stringify(macro));
		}}>
			<div className="w-[33%] flex flex-col ">
				<div className="name h-1/2 text-[18px] text-neutral-300 flex items-end "> {icon[macro.type]} <div className="mx-1" /> <b>{`\"${macro.key}\"`}</b> </div>
				<div className="inputs h-1/2 w-content flex  items-end text-neutral-400 text-[18px] ">
					<div className="absolute w-[content] left-[20px] bottom-0 flex text-ellipsis">
						{macro.inputs.map((e, i) => <div className='flex w-content items-center '>
							{e.delay ? (e.delay / 1000 + 's') : e.key.toUpperCase()}
							{i != macro.inputs.length - 1 && <IconArrowNarrowRight size={18} />}
						</div>)
						}
					</div>
				</div>
			</div>

			<div className="grow center ">
				<div className="text-[20px]">{macro.name}</div>
			</div>

			<div className="w-[33%] flex justify-end text-[22px] gap-x-4 items-center ">
				<div className="rounded-md p-1 aspect-[1/1] hover:bg-neutral-500 " onClick={e => {
					e.stopPropagation()
					setView(<Create edit={macro} />)
				}} >
					<IconPencil />
				</div>
				<div className="rounded-md p-1 aspect-[1/1] hover:bg-neutral-500 " onClick={e => {
					e.stopPropagation();
					delete macros_bc[macro.id];
					send('save', JSON.stringify(macros_bc));
					setMacros({ ...macros_bc });
				}} >
					<IconTrash />
				</div>

			</div>
		</div>
	)
}

export default function Home() {
	const [macros, setMacros] = useState(macros_bc);
	const [r, refresh] = useState(running)
	// console.log('am i looping')

	useEffect(() => {
		window.setMacros = setMacros;
		window.refresh = refresh;

		window.ipc.on('load', (e) => {
			// console.log(e);
			if (!e) return //console.log('no macas');
			macros_bc = JSON.parse(e);
			setMacros({ ...macros_bc });
		})

		window.ipc.on('running', (e) => {
			let t = JSON.parse(e)
			running = t.running || {};
			paused = t.paused || {};
			console.log('got running:', t);
			refresh(Math.random())
		})

		send('running');
		send('load');

		return () => {
			window.ipc.off('load')
			window.ipc.off('running')
		}
	}, [])

	return (
		<div className="w-full h-full flex flex-col">
			<div className="bg-neutral-950 hover:bg-neutral-700 center text-[25px] flex gap-2 h-[75px] " onClick={e => setView(<Create />)} >
				<IconSquareRoundedPlus size={24} />
				Create New
			</div>
			<div className="grow w-full h-1 overflow-y-auto ">
				{Object.values(macros).map(e => <Macro macro={e} key={Math.random()} />)}
			</div>
		</div>

	)
}

// document.addEventListener('mouseover', e => {
// 	if(!e.target.classList.includes('mac')) return;
// 	if(e.target.classList.includes('active')) {
// 		e.target.
// 	}
// })