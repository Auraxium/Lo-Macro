import sys
import keyboard

print(f"startin", flush=True)

map = {
    "'": 91
}

try:
    while True:
        # time.sleep(.5) 
        line = sys.stdin.readline()
        if not line:
            break  
        
        # msg = json.loads(line)
        msg = line.strip().split("$")
        # print(msg, flush=True)

        key = msg[0]
        # key = int(msg[0])
        # key = int(key) if str(key).isdigit() else key
        key = map.get(key, key)
        
        keyboard.press(key) if msg[1] == "0" else keyboard.release(key)

except KeyboardInterrupt:
    pass
