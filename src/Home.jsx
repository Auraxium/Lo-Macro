import { useState, useRef, useEffect } from 'react'
import {
	IconArrowLeft, IconReload, IconToggleRight, IconArrowNarrowRight,
	IconArrowBigDownLine, IconArrowUp, IconArrowDown, IconSquareRoundedPlus,
	IconTrash, IconPencil, IconCopy,
	IconPlus,
	IconSearch,
	IconX,
	IconArrowRight,
	IconSettings,
	IconHome,
	IconHome2,
	IconRefresh,
	IconCheck,
	IconAlertTriangleFilled,
} from '@tabler/icons-react';
import Create from './Create';

let icon = {
	once: <IconArrowNarrowRight />,
	hold: <IconArrowBigDownLine />,
	loop: <IconRefresh />,
	toggle: <IconToggleRight />,
	bind: <IconCopy />,
}

let nset = (s) => `
					<div class="w-full newsetE h-[70px] bg-neutral-700 border-b center border-neutral-600 relative flex-col">
						<input type="text" class='unset, relative -top-2 bg-neutral-900 newset w-[65%] text-center ' value="${s || ''}"/> 
						<div class="absolute bottom-0 left-0, sel-num-new text-neutral-300 ">0 macros</div>
						<div class="absolute p-1 bottom-0 right-0">&#10004;</div>
						<div class="absolute p-1 bottom-0 left-0">&#10005;</div>
						</div>`

let states = {}

let ctx_ev = {};

const Context = () => {
	let [Render, setRender] = useState(<div />)
	let c = useRef();

	useEffect(() => {
		// console.log(c.current, ctx_ev)
		c.current.style.top = ctx_ev.pageY + 'px';
		c.current.style.left = ctx_ev.pageX + 'px';
		c.current.style.display = 'block';
	})

	useEffect(() => {
		window.setContext = (ev, rend) => {
			ctx_ev = ev;
			setRender(rend);
		}

		function remove() {
			c.current.style.display = 'none'
		}

		return () => document.removeEventListener('onclick', e => remove())
	}, [])

	return <div ref={c} className="absolute hidden z-10 w-[200px]  ">
		{Render}
	</div>
}

const Macro = ({ macro, ac }) => {
	let [active, setActive] = useState(running[macro.id])
	// active = running[macro.id];
	// console.log(active);

	if (macro.id == "gmh6g89") {
		// console.log(active, running, running[macro.id]);
		// console.log('ba');
	}

	return (
		<div className={` ${(active && pausa(macro.id) && 'paused ') || (active && ' bg-[#134e4a] ') || ' bg-neutral-800 hover:bg-neutral-700 '} relative flex px-[20px] border-b border-neutral-700 text-[25px] min-h-[75px]`}
			macro={macro.id}
			onClick={e => {
				// console.log(JSON.parse(JSON.stringify(macro)));
				if (window.selects) {
					let t = window.selects.macros[macro.id]
					window.selects.macros[macro.id] = !t;
					!t ? window.selects.macros[macro.id] = 1 : delete window.selects.macros[macro.id];
					//  t? e.currentTarget.classList.remove('!bg-[#1d6632]'):e.currentTarget.classList.add('!bg-[#1d6632]')
					e.currentTarget.classList.toggle('!bg-[#1d6632]');
					$('.sel-num-new').innerHTML = Object.keys(window.selects.macros).length + ' macros';
					// console.log(window.selects);
					return;
				}
				setActive(!active);
				running[macro.id] = 1
				send('run', JSON.stringify(macro));
			}}
			onContextMenu={(e) => setContext(e,
				<div className='w-[125px] bg-neutral-600'>
					bababoie
				</div>
			)}
		>

			<div className="w-[33%] flex flex-col ">
				<div className="name h-1/2 text-[18px] text-neutral-300 flex items-end "> {icon[macro.type]} <div className="mx-1" /> <b>{macro.key ? `\"${macro.key}\"` : ''}</b> </div>
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
					send('save', JSON.stringify({ [`macros.${macro.id}.$`]: 1 }));
					delete macros_bc[macro.id];
					setMacros({ ...macros_bc });
				}} >
					<IconTrash />
				</div>
			</div>
		</div>
	)
}

const Set = ({ set }) => {
	let macs = Object.keys(set.macros)

	return <div set={set.id} className="w-full p-1 h-[60px] bg-neutral-800 hover:bg-neutral-600 border-b center border-neutral-600 relative flex-col"
		onClick={e => {
			// macs.forEach(e => send('run', JSON.stringify(macros_bc[e])))
			send('run', JSON.stringify(macs.map(e => macros_bc[e])))
		}}
	>
		<div className="center relative -top-2  sel-name ">{set.name}</div>
		<div class="absolute bottom-0 left-0, sel-num text-neutral-300 ">{macs.length} macros</div>
		<div className="absolute hover:bg-neutral-500 icon top-[2px] right-[2px]" onClick={e => {
			e.stopPropagation();
			send('save', JSON.stringify({ [`sets.${set.id}.$`]: 1 }));
			delete window.sets[set.id];
			window.refresh()
		}}><IconTrash size={18} /></div>
		<div className="absolute hover:bg-neutral-500 icon top-[2px] left-[2px]" onClick={e => {
			e.stopPropagation()
			window.selects = set;
			let d = $('.newset');
			if (d) d.parentElement.remove();
			$(`[set=${set.id}]`).outerHTML = nset(set.name);
			macs.forEach(e => $(`[macro="${e}"`).classList.add('!bg-[#1d6632]'))
			$('.newset')?.focus() || null;
			$('.selects').style.display = 'flex';
		}}
		>
			<IconPencil size={18} />
		</div>
	</div>

	// return <div className="w-full h-[70px] bg-neutral-800 border-b center border-neutral-600 relative flex-col">
	// 	<div className="center"></div>
	// 	<div className="absolute bottom-0 text-neutral-600 ">{macs.length} macros</div>
	// 	<div className="absolute right-0"><IconTrash/></div>
	// 	<div className="absolute"><IconPencil/></div>
	// </div>
}

const Panel = () => {
	let [sets, setSets] = useState(window.sets);
	sets = window.sets;

	useEffect(() => {
		states.setSets = setSets;
		window.setSets = setSets;
	}, [])

	return <div className="bg-zinc-950 absolute h-full p-1 left-[-185px] w-[175px] rounded-xl "> {/* sets */}
		<div className="py-[1px], rounded-xl bg-[#323232] w-full h-full flex flex-col items-center, py-1  ">
			{/* <span className='center border-b-[1px],'>Lo Macro</span> */}
			<div className="p-1 icon-hover rounded-t-md ">
				<IconHome className='center w-full' size={36} />
			</div>

			<div className="sets flex flex-col grow overflow-scroll nsb gap-y-2, ">
				<div className="bg-neutral-900 icon-hover h-[60px] flex center pen" onClick={e => {
					window.selects = {
						id: window.uid(),
						name: '',
						macros: {},
					};
					let d = $('.newset');
					if (d) d.parentElement.remove();
					e.currentTarget.nextElementSibling.firstChild.innerHTML += nset();
					$('.newset')?.focus() || null;
					$('.selects').style.display = 'flex'
				}}>
					<IconPlus />
					Create Set
				</div>
				{/* <div className="border-b flex center">Sets</div> */}
				<div className="grow ">
					<div className="flex flex-col-reverse">
						{Object.values(sets).map((e, i) => <Set set={e} key={i} />)}
					</div>

				</div>
			</div>
			<IconSettings />
		</div>
	</div>
}

export default function Home() {
	const [macros, setMacros] = useState(macros_bc || {});
	const [r, refresh] = useState(Math.random())

	// console.log(macros_bc);

	useEffect(() => {
		window.setMacros = setMacros;
		window.refresh = () => refresh(Math.random());

		// console.log(macros_bc);
		if (!Object.keys(macros_bc).length) send('load')

	}, [])

	return (
		<>
			<Context />

			<div className="fixed w-14 h-12 bottom-4 right-4 border " onClick={e => {
				{/* fix buutton */ }
				Object.keys(macros_bc).forEach(e => {
					let mac = macros_bc[e];
					if (mac.type == 'toggle') mac.type = 'loop'
				})
				console.log(macros_bc);
				// send('save', JSON.stringify({ macros: macros_bc }))

				// Object.keys(macros_bc).forEach(e => macros_bc[e].duration=macros_bc[e].inputs.reduce((acc, e) => acc+=e.duration||70, 0) + (120*macros_bc[e].inputs.length))
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
				// console.log(macros);
				window.refresh();
			}}>
				fiix
			</div>

			<div className="w-full h-full flex flex-col relative">

				{window.hard_pause && <div className="bold absolute -top-7 flex w-full text-yellow-500 justify-center gap-1 "><IconAlertTriangleFilled /> Hard Paused</div> || ''}

				<Panel />

				<div className=" h-[60px] w-full border-b-[1px] border-zinc-500 flex justify-between p-1 ">
					<div className="rounded-sm cursor-pointer p-1 bg-teal-700 hover:bg-teal-600 center" onClick={e => setView(<Create />)} >
						<IconPlus className='me-1' />
						New Macro
					</div>

					<div className="flex center gap-1">
						<IconSearch className='me-1' />
						<input className='p-1' placeholder='search' />
						<IconX />
					</div>
				</div>

				<div className="grow w-full overflow-y-auto">
					<div className="flex flex-col-reverse  ">
						{Object.values(macros).map(e => <Macro macro={e} key={Math.random()} />)}
					</div>
				</div>

				<div className="selects w-full bg-[#323232] h-[175px] hidden p-1">
					<div className="grow flex"></div>
					<div className="w-[30%] flex items-center gap-2">
						<div className="w-[50%] rounded-lg h-full border-neutral-700 border-[2px] center " onClick={cancel}>cancel</div>
						<div className="w-[50%] rounded-lg h-full border-neutral-700 border-[2px] center bg-teal-700 " onClick={saveSet}>save</div>
					</div>
				</div>

			</div>
		</>

	)
}

function cancel() {
	window.selects = null;
	$('.selects').style.display = 'none';
	$('.newsetE').remove();
	window.refresh()
}

function saveSet() {
	window.sets[window.selects.id] = { ...window.selects, name: $('.newset').value };
	send('save', JSON.stringify({ [`sets.${window.selects.id}`]: window.sets[window.selects.id] }))
	window.selects = null;
	$('.selects').style.display = 'none';
	$('.newsetE').remove();
	// states.setSets({ ...window.sets })
	window.refresh()
}

// document.addEventListener('mouseover', e => {
// 	if(!e.target.classList.includes('mac')) return;
// 	if(e.target.classList.includes('active')) {
// 		e.target.
// 	}
// })