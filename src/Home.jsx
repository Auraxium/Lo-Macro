import { useState, useRef, useEffect } from 'react'
import {
	IconArrowLeft, IconReload, IconToggleRight, IconArrowNarrowRight,
	IconArrowBigDownLine, IconArrowUp, IconArrowDown, IconSquareRoundedPlus,
	IconTrash, IconPencil, IconCopy,
} from '@tabler/icons-react';
import Create from './Create'

const Macro = ({ macro }) => {
	const [active, setActive] = useState(false)

	return (
		<div className={` ${!active && '!bg-neutral-800 hover:!bg-neutral-700 '} flex px-[20px] border-b border-neutral-700 text-[25px] h-[75px]`} onClick={e => {
			// console.log(macro);
			setActive(!active);
			send('run', JSON.stringify(macro));
		}}>
			<div className="w-[33%] flex flex-col ">
				<div className="name h-1/2 text-[18px] text-neutral-300 flex items-end "> <b>{`\"${macro.key}\"`}</b> </div>
				<div className="inputs h-1/2 w-content flex  items-end text-neutral-400 text-[18px] ">
					<div className="fixed">
						{macro.inputs.map((e, i) => <div className='flex w-content items-center '>
							{(() => {
								if (i != 0) return;
								if (macro.type == 'once') return <> <IconArrowNarrowRight /> <div className="mx-1" /> </>
								if (macro.type == 'hold') return <> <IconArrowBigDownLine /> <div className="mx-1" /> </>
								if (macro.type == 'toggle') return <> <IconToggleRight /> <div className="mx-1" /> </>
								if (macro.type == 'bind') return <> <IconCopy /> <div className="mx-1" /> </>
								return
							})()}
							{e.key.toUpperCase()}
							{i != macro.inputs.length - 1 && <IconArrowNarrowRight size={18} />}
						</div>)}
					</div>

				</div>
			</div>

			<div className="grow center ">
				<div className="text-[20px]">{macro.name}</div>
			</div>

			<div className="w-[33%] flex justify-end text-[22px] gap-x-4 items-center ">
				<div className="rounded-md p-1 aspect-[1/1] hover:bg-neutral-500 " onClick={e => {
					e.stopPropagation();
					delete macros_bc[macro.id];
					send('save', JSON.stringify(macros_bc));
					setMacros({ ...macros_bc });
				}} >
					<IconTrash />
				</div>
				<div className="rounded-md p-1 aspect-[1/1] hover:bg-neutral-500 " onClick={e => {
					e.stopPropagation()
					setView(<Create edit={macro} />)
				}} >
					<IconPencil />
				</div>
			</div>
		</div>
	)
}

export default function Home() {
	// let nav = useNavigate()
	const [macros, setMacros] = useState(macros_bc);

	useEffect(() => {
		window.setMacros = setMacros;
		if (Object.keys(macros).length) return;
		send('load')

		electron.ipcRenderer.on('load', (e, pl) => {
			// console.log(pl);
			macros_bc = JSON.parse(pl);
			setMacros({ ...macros_bc });
		})
	}, [])

	return (
		<>
			<div className="bg-neutral-950 hover:bg-neutral-700 center text-[25px] flex gap-2 h-[75px] " onClick={e => setView(<Create />)} >
				<IconSquareRoundedPlus size={24} /> Create New</div>
			<div className="overflow-scroll odd:!bg-teal-900 even:!bg-teal-800 ">
				{Object.values(macros).map(e => <Macro macro={e} key={e.id} />)}
			</div>
		</>
	)
}