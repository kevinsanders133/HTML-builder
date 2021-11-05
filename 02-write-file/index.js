const readline = require('readline');
const fs = require('fs');
const path = require('path');

const filename = path.join(__dirname, 'text.txt');
const writable = fs.createWriteStream(filename, {encoding: 'utf8'});

let rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt('What do you think of Node.js? ');
rl.prompt();

rl.on('line', (answer) => {
    console.log(`Thank you for your valuable feedback: ${answer}`);
    writable.write(answer);
    rl.prompt();
});

rl.on('SIGINT', () => {
    console.log('\nGoodbye');
    rl.close();
    writable.close();
});