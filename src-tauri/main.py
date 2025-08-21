import keyboard, mouse, sys, json, random

data = {}
try:
	with open('mac_data.json') as f:
		data = json.loads(f.read())
except:
	with open('mac_data.json', 'w') as f:
		f.write("{}")

def log(*s):
    print(*s, flush=True)

ports = {
	'test': lambda *e: f"#{format(int(random.random() * 16777215), '06X')}",
	'load': lambda e: data,
}

try:
	while True:
		line = sys.stdin.readline()
		if not line:
			break
		if line[0] != '{':
			print(line, flush=True)
			continue
		query = json.loads(line)
		if 'port' in query and query['port'] in ports:
			res = ports[query['port']](query)
			if 'uid' in query:
				log(json.dumps({**query, 'res': res}))

except KeyboardInterrupt:
	pass