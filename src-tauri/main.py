import sys, json, keyboard, threading, subprocess, time, random, asyncio, pydirectinput

def log(*s):
    print(*s, flush=True)
    
data = {
  'macros': {},
  'sets': {},
}

active = {}
running = {}
holding = {}
watch_keys = {}

_loop = asyncio.new_event_loop()

def _runner():
    asyncio.set_event_loop(_loop)
    _loop.run_forever()

threading.Thread(target=_runner, daemon=True).start()

def keyTracker():
    proc = subprocess.Popen(
        ["keyTracker.exe"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,  # ensures stdout is str not bytes (Python 3.7+)
        bufsize=1   # line-buffered
    )
    
    down_check = {
        '0': True,
        '2': True,
    }
    
    scan_map = {}

    for line in proc.stdout:
        line = line.strip()
        if not line:
            continue

        spl = line.split(',')
        if len(spl[2]) == 1:
            continue
        
        if spl[0] in holding:
            continue
        
        down = None
        key = int(spl[0])
        down = down_check.get(spl[1]) or False
        
        # log(line)
        # log(down, key, watch_keys)
        
        if down and key in watch_keys:
            for e in watch_keys[key]:
                asyncio.run_coroutine_threadsafe(run(active[e]), _loop)
    
threading.Thread(target=keyTracker, daemon=True).start()

def keyDown(key):
    pass

def keyUp(key):
    pass

async def keyTap(key):
    if 'delay' in key:
        await asyncio.sleep(key['delay']/1000)
        return
    # log(key['key'])
    # pydirectinput.keyDown(key['key'])
    keyboard.press(key['key'])
    await asyncio.sleep(key['down']/1000)
    keyboard.release(key['key'])
    # pydirectinput.keyUp(key['key'])
    
async def loop_inputs(inputs):
    for x in inputs:
        await keyTap(x)
        await asyncio.sleep(0.05)

async def once(mac):
    await loop_inputs(mac['inputs'])
        
async def hold(mac):
    try:
        while mac['activate'] in holding:
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
    match mac['type']:
        case 'once':
            running[mac['id']] = asyncio.create_task(once(mac))
        case 'hold':
            running[mac['id']] = asyncio.create_task(toggle(mac))
        case 'toggle':
            if mac['id'] in running:
                running[mac['id']].cancel()
                del running[mac['id']]
                return
            running[mac['id']] = asyncio.create_task(toggle(mac))
            
def activate(mac): 
    id = mac.get('id')
    activate = mac.get('activateCode')
    if id in active:
        active.pop(id, None)
        watch_keys.get(activate).remove(id)
    else: 
        active[id] = mac
        watch_keys.setdefault(activate, set()).add(id)
        
        # keyboard.on_press_key(mac['activate'], lambda e: asyncio.run_coroutine_threadsafe(run(mac), _loop))
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