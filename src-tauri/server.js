const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

let ports = {
  test: () => `#${Math.floor(Math.random() * 16777215).toString(16).toLocaleUpperCase()}`
};

rl.on("line", (line) => {
  // console.log('data:', line)
  if (line[0] != "{") return;
  let data;
  try {
    data = JSON.parse(line);
  } catch (e) {}
  if (!data) return;
  if (ports[data.port]) {
    let res = ports[data.port](data);
    if (res) console.log(JSON.stringify({ ...data, res }));
  }
});

function send(port, res) {
  if (typeof res == "object") res = JSON.stringify(s);
  res.event ??= port;
  console.log(s);
}

process.on("SIGINT", () => {
  rl.close();
  process.exit();
});
