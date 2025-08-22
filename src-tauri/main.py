import sys, json, keyboard, threading, time, random, asyncio, pydirectinput

pydirectinput.KEYBOARD_MAPPING["left shift"] = 0xA0
pydirectinput.KEYBOARD_MAPPING["right shift"] = 0xA1

_loop = asyncio.new_event_loop()

def _runner():
    asyncio.set_event_loop(_loop)
    _loop.run_forever()

threading.Thread(target=_runner, daemon=True).start()

def log(*s):
    print(*s, flush=True)
    
data = {
  'macros': {},
  'sets': {},
}

active = {}
running = {}
downs = {}

def keyDown(key):
    pass

def keyUp(key):
    pass

async def keyTap(key):
    if 'delay' in key:
        await asyncio.sleep(key['delay']/1000)
        return
    # log(key['key'])
    pydirectinput.keyDown(key['key'])
    await asyncio.sleep(key['down']/1000)
    pydirectinput.keyUp(key['key'])
    
async def loop_inputs(inputs):
    for x in inputs:
        await keyTap(x)
        await asyncio.sleep(0.05)

async def once(mac):
    await loop_inputs(mac['inputs'])
        
async def hold(mac):
    try:
        while mac['activate'] in downs:
            await loop_inputs(mac['inputs'])
            await asyncio.sleep(0)
    except asyncio.CancelledError:
        raise
    pass

async def toggle(mac):
    try:
        while mac['id'] in running:
            await loop_inputs(mac['inputs'])
            await asyncio.sleep(0)
    except asyncio.CancelledError:
        raise

async def run(mac):
    if mac['activate'] in downs:
        return #log('stop spamming')
    downs[mac['activate']] = 1
    match mac['type']:
        case 'once':
            running[mac['id']] = asyncio.create_task(once(mac))
        case 'hold':
            pass
        case 'toggle':
            if mac['id'] in running:
                running[mac['id']].cancel()
                del running[mac['id']]
                return
            running[mac['id']] = asyncio.create_task(toggle(mac))
            
def activate(mac): 
    if mac['id'] in active:
        active[mac['id']]() # removes hotkey i guess
        del active[mac['id']]
    else: 
        active[mac['id']] = keyboard.on_press_key(mac['activate'], lambda e: asyncio.run_coroutine_threadsafe(run(mac), _loop))
    log(json.dumps({'event': 'active', 'data': {'active': list(active.keys()), 'running': list(running.keys())}}))

def clear():
    # get keys in active -> keyboard.remove_keys
    # get keys in running -> stop mid run + up any down keys
    keyboard.unhook_all()
    global active 
    global running 
    global downs 
    active = {}
    running = {}
    downs = {}
    log(json.dumps({'event': 'active', 'data': {'active': [], 'running': []}}))

keyboard.add_hotkey('home', clear)

def handler(event):
    # log(event.scan_code)
    if event.event_type == "up":
        try: 
            del downs[event.name] # event.name annoyingly volitile, map a mapper in frontend
        except:
            pass

keyboard.hook(handler)

ports = {
    "test": lambda e: f"#{format(int(random.random() * 16777215), '06X')}",
    "load": lambda e: data,
    "activate": lambda e: activate(e['mac']),
    "clear": clear,
}

try:
    while True:
        line = sys.stdin.readline()
        if not line:
            break
        if line[0] != "{":
            log(line)
            continue
        # log(line)
        query = json.loads(line)
        if query["port"] == "exit":
            break
        if "port" in query and query["port"] in ports:
            res = ports[query["port"]](query)
            if "uid" in query:
                try:
                    log(json.dumps({**query, "res": res}))
                except:
                    log(json.dumps({**query, "res": "couldnt stringify result"}))
        elif "uid" in query:
            log(json.dumps({**query, "err": "no port"}))

except KeyboardInterrupt:
    pass