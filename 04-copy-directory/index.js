const { rm, mkdir, readdir, copyFile } = require('fs/promises');
const path = require('path');

const oldDir = path.join(__dirname, 'files');
const newDir = path.join(__dirname, 'files-copy');

async function copyDir() {
    try {
        await rm(newDir, {recursive: true, force: true});
        await mkdir(newDir);
        const files = await readdir(oldDir);
        for await (const file of files) {
            await copyFile(path.join(oldDir, file), path.join(newDir, file));
        }
    } catch(err) {
        console.log(err);
    }
}

copyDir();
