const { stat } = require('fs');
const { readdir } = require('fs/promises');
const path = require('path');

const secretFoder = path.join(__dirname, 'secret-folder');

async function readDirectory() {
    try {
        const files = await readdir(secretFoder, {withFileTypes: true});
        for await (const file of files) {
            const promise = new Promise((resolve) => {
                stat(path.join(secretFoder, file.name), (err, stats) => {
                    if (stats.isFile()) {
                        const extensionWithDot = path.extname(file.name);
                        const fileName = path.basename(file.name, extensionWithDot);
                        const extension = extensionWithDot.slice(1);
                        const size = `${stats.size / 100}kb`;
                        console.log(`${fileName} - ${extension} - ${size}`);
                    }
                    resolve();
                });
            });
            await promise.then();
        }
    } catch (err) {
        console.error(err);
    }
}

readDirectory();