const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});
let send;

console.log("something" + JSON.stringify(process.argv));

let ports = {
  test: () =>
    `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .toLocaleUpperCase()}`,
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
  if (typeof res != "string") res = JSON.stringify(s);
  res.event ??= port;
  console.log(s);
  if(process.argv[2] !== "prod") send(res)
}

process.on("SIGINT", () => {
  rl.close();
  process.exit();
  ws.close()
});

if (process.argv[2] !== "prod") {
  const { WebSocketServer } = require("ws");
  const wss = new WebSocketServer({ port: 23239 });

  wss.on("connection", (ws) => {
    console.log("invader");
    ws.on("error", console.error);

    ws.on("message", (e) => {
      let line = e.toString();
      if (line[0] != "{") return console.log(line);
      let data;
      try {
        data = JSON.parse(line);
      } catch (e) {}
      if (!data) return;
      if (ports[data.port]) {
        let res = ports[data.port](data);
        if (res) ws.send(JSON.stringify({ ...data, res }));
      }
    });

    ws.on("close", () => {
      console.log("Disconnected from server");
      ipc = null;
    });

    ws.send("something");
    send = ws.send;
  });
}

// ws.on('')

// ws.on("message", (event) => {
//   console.log(event)
//   let line = event.data;
//   if (line[0] != "{") return;
//   let data;
//   try {
//     data = JSON.parse(line);
//   } catch (e) {}
//   if (!data) return;
//   if (ports[data.port]) {
//     let res = ports[data.port](data);
//     if (res) ws.send(JSON.stringify({ ...data, res }));
//   }
// });

// ws.on("close", () => {
//   console.log("Disconnected from server");
//   ipc = null;
// });
