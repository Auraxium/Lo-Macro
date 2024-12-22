import { useState, useRef, useEffect } from 'react'
import {
	IconArrowLeft, IconReload, IconToggleRight, IconArrowNarrowRight,
	IconArrowBigDownLine, IconArrowUp, IconArrowDown, IconSquareRoundedPlus,
	IconTrash, IconPencil, IconCopy,
	IconPlus,
	IconSearch,
	IconX,
	IconArrowRight,
} from '@tabler/icons-react';
import Create from './Create';

let icon = {
	once: <IconArrowNarrowRight />,
	hold: <IconArrowBigDownLine />,
	toggle: <IconToggleRight />,
	bind: <IconCopy />,
}

const Macro = ({ macro, ac }) => {
	let [active, setActive] = useState(running[macro.id])
	// active = running[macro.id];
	// console.log(macro);
	

	return (
		<div className={` ${(active && pausa(macro.id) && 'paused ') || (active && ' bg-[#134e4a] ') || ' !bg-neutral-800 hover:!bg-neutral-700 '}  relative flex px-[20px] border-b border-neutral-700 text-[25px] min-h-[75px]`} onClick={e => {
			console.log(JSON.parse(JSON.stringify(macro)));
			setActive(!active);
			send('run', JSON.stringify(macro));
		}}>
			
			<div className="w-[33%] flex flex-col ">
				<div className="name h-1/2 text-[18px] text-neutral-300 flex items-end "> {icon[macro.type]} <div className="mx-1" /> <b>{`\"${macro.key}\"`}</b> </div>
				<div className="inputs h-1/2 w-content flex  items-end text-neutral-400, text-[18px] ">
					<div className="absolute w-[content] left-[20px] bottom-0 flex text-ellipsis, slide" inp={macro.id} >
						{macro.inputs.map((e, i) => <div className='flex w-content items-center '>
							{e.delay ? (e.duration / 1000 + 's') : e.key.toUpperCase()}
							{i != macro.inputs.length - 1 && <span className='mx-1'>→</span>}{/*<IconArrowRight className='bg-transparent' />*/}
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
					send(JSON.stringify(macro))
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
	const [macros, setMacros] = useState(macros_bc || {});
	const [r, refresh] = useState(running)

	// console.log(macros_bc);

	useEffect(() => {
		window.setMacros = setMacros;
		window.refresh = refresh;

		if(!Object.keys(macros_bc).length) send('load')

	}, [])

	return (
		<div className="w-full h-full flex flex-col relative z-10">
			<div className="fixed w-14 h-12 bottom-4 right-4 border " onClick={e => {
				Object.keys(macros_bc).forEach(e => macros_bc[e].duration=macros_bc[e].inputs.reduce((acc, e) => acc+=e.duration||70, 0) + (120*macros_bc[e].inputs.length))
				// Object.keys(macros_bc).forEach(id => macros_bc[id].inputs.forEach((e,i) => {
				// 	if(e.key == 'delay') {
				// 		if(e.delay > 1) e.duration = e.delay
				// 		e.delay = 1;
				// 		delete e.key;
				// 	}
				// 	if(e.delay) {
				// 		if(e.delay > 1) e.duration = e.delay
				// 		e.delay = 1;
				// 	} 
				// 	delete e.keycode;
				// 	delete e.down;

				// 	macros_bc[id].inputs[i] = e;
				// }))
				console.log(macros);
				window.refresh();

			}}>fiix</div>

			{/* <div className="absolute h-full border-y-[1px] border-s-[1px] -left-4 w-4 z-20 ">asd</div> */}

			<div className=" h-[60px] w-full border-b-[1px] border-zinc-500 flex justify-between p-1 ">
				<div className="rounded-sm cursor-pointer p-1 bg-teal-700 hover:bg-teal-600 center" onClick={e => setView(<Create />)} >
					<IconPlus className='me-1' />
					New Macro
				</div>

				<div className="flex center gap-1">
					<IconSearch className='me-1'/>
					<input className='p-1' placeholder='search' />
					<IconX/>
				</div>
			</div>

			<div className="grow w-full overflow-y-auto">
				<div className="flex flex-col-reverse  ">
					{Object.values(macros).map(e => <Macro macro={e} key={Math.random()} />)}
				</div>
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