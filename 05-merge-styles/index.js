const fs = require('fs');
const { stat } = require('fs');
const { rm, readdir } = require('fs/promises');
const path = require('path');

const bundle = path.join(__dirname, 'project-dist', 'bundle.css');
const styles = path.join(__dirname, 'styles');

async function mergeStyles() {
    const files = await readdir(styles);
    await rm(bundle, {force: true});
    const writable = fs.createWriteStream(bundle, { encoding: 'utf-8' });
    for await (const file of files) {
        const filePath = path.join(styles, file);
        const promise = new Promise((resolve) => {
            stat(filePath, async (err, stats) => {
                if (stats.isFile() && path.extname(file) == '.css') {
                    const readable = fs.createReadStream(filePath, { encoding: 'utf-8' });
                    for await (const chunk of readable) {
                        writable.write(chunk);
                    }
                    readable.close();
                }
                resolve();
            });
        });
        await promise.then();
    }
    writable.close();
}

mergeStyles();