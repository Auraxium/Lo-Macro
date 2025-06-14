import { Command } from '@tauri-apps/plugin-shell';

export let ipc;

async function runCommand() {
  ipc = new Command('spawner', {
    // program: 'node', // or 'python', 'bash', etc.
    args: ['node server.js'], // or any arguments you want
  });

  // Listen for stdout line-by-line
  ipc.stdout.on('data', (line) => {
    console.log('[stdout]', line);
  });

  // Listen for stderr
  ipc.stderr.on('data', (line) => {
    console.error('[stderr]', line);
  });

  // Handle process exit
  ipc.on('close', (data) => {
    console.log('Process exited with code', data.code);
  });

  await ipc.spawn(); // Start the process
  console.log('new command', ipc); 
}

if(!ipc) runCommand()

document.addEventListener('beforeunload', e => {
  ipc.kill()
})