const fs = require('fs');
const path = require('path');

const filename = path.join(__dirname, 'text.txt');

async function logChunks(readable) {
    for await (const chunk of readable) {
        console.log(chunk);
    }
    readable.close();
}

const readable = fs.createReadStream(filename, {encoding: 'utf8'});
logChunks(readable);