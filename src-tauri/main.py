import sys, json, keyboard, time, random, asyncio, pydirectinput

pydirectinput.KEYBOARD_MAPPING["left shift"] = 0xA0
pydirectinput.KEYBOARD_MAPPING["right shift"] = 0xA1

def log(*s):
    print(*s, flush=True)
    
data = {
  'macros': {},
  'sets': {},
}

active = {}
running = {}

def keyDown(key):
    pass

def keyUp(key):
    pass

async def keyTap(key):
    if 'delay' in key:
        await asyncio.sleep(key['delay']/1000)
        return
    log(key['key'])
    pydirectinput.keyDown(key['key'])
    await asyncio.sleep(key['down']/1000)
    pydirectinput.keyUp(key['key'])
    
async def loop_inputs(inputs):
    for x in inputs:
        await keyTap(x)
        await asyncio.sleep(0.05)

async def once(mac):
    # running[mac['id']] = asyncio.run(loop_inputs(mac['inputs']))
    await loop_inputs(mac['inputs'])
        
async def hold(mac):
    
    pass

async def toggle(mac):
    while mac['id'] in running:
        await loop_inputs(mac['inputs'])

types = {
    'once': once,
    'hold': hold,
    'toggle': toggle
}

def run(mac):
    match mac['type']:
        case 'once':
            # asyncio.run(once(mac))
            running[mac['id']] = asyncio.create_task(once(mac))
            log('ranit')
        case 'hold':
            pass
        case 'toggle':
            if mac.id in running:
                del running[mac['id']]
                return
            running[mac['id']] = asyncio.create_task(toggle(mac))
            pass
            
def activate(mac): 
    if mac['id'] in active:
        # keyboard.remove_hotkey(active[mac['id']])
        active[mac['id']]() # removes hotkey i guess
        del active[mac['id']]
    else: 
        active[mac['id']] = keyboard.on_press_key(mac['activate'], lambda e: run(mac))
    log(json.dumps({'event': 'active', 'data': {'active': list(active.keys()), 'running': list(running.keys())}}))

def clear():
    # get keys in active -> keyboard.remove_keys
    # get keys in running -> stop mid run + up any down keys
    pass

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