const readline = require('readline');



const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let msgs = {
  'test': (e) => 'ur gay'
}

rl.on('line', (line) => {
  // console.log('data:', line)
  if (line[0] != '{') return;
  let data;
  try {
    data = JSON.parse(line);
  } catch (e) {}
  if (!data) return;
  if(msgs[data.port]) {
    let res = msgs[data.port](data);
    if(res) console.log(JSON.stringify({...data, res}))
  } 
});

function reply(s) {
  if(typeof(s)=='object') s = JSON.stringify(s);
  console.log(s)
}



process.on('SIGINT', () => {
  rl.close();
  process.exit();
});
