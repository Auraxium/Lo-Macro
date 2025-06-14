const readline = require('readline');

// Create readline interface to read from stdin
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  if (line === 'test') {
    console.log('Hi');
  }
});

// Handle Ctrl+C (SIGINT)
process.on('SIGINT', () => {
  // Cleanup if needed
  rl.close(); // Optional, depending on your needs
  process.exit(); // Gracefully exit
});
