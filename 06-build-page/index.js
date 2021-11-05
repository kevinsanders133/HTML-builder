const fs = require('fs');
const { stat } = require('fs');
const { rm, mkdir, readdir, copyFile } = require('fs/promises');
const readline = require('readline');
const path = require('path');

const dist  = path.join(__dirname, 'project-dist');
const htmlRes  = path.join(dist, 'index.html');
const cssRes = path.join(dist, 'style.css');
const assetsRes = path.join(dist, 'assets');

const template = path.join(__dirname, 'template.html');
const components = path.join(__dirname, 'components');
const styles = path.join(__dirname, 'styles');
const assets = path.join(__dirname, 'assets');

async function createBundle() {
    try {
        // Create dist
        await rm(dist, {recursive: true, force: true});
        await mkdir(dist);

        // Copy assets
        await mkdir(assetsRes);
        async function copyDir(oldDir, newDir) {
            const oldFiles = await readdir(oldDir, {recursive: true});
            for await (const file of oldFiles) {
                const promise = new Promise((resolve) => {
                    stat(path.join(oldDir, file), async (err, stats) => {
                        if (stats.isDirectory()) {
                            await mkdir(path.join(newDir, file));
                            await copyDir(path.join(oldDir, file), path.join(newDir, file));
                        } else {
                            await copyFile(path.join(oldDir, file), path.join(newDir, file));
                        }
                        resolve();
                    });
                });
                await promise.then();
            }
        }
        await copyDir(assets, assetsRes);

        // Gather styles
        const writeCss = fs.createWriteStream(cssRes, {encoding: 'utf8'});
        const stylesFiles = await readdir(styles);
        for await (const file of stylesFiles) {
            const readCss = fs.createReadStream(path.join(styles, file), {encoding: 'utf8'});
            for await (const chunk of readCss) {
                writeCss.write(chunk);
            }
            readCss.close();
        }
        writeCss.close();

        // Replace components with html
        const componentsFiles = await readdir(components);
        const regEx = /{{.*}}/;
        let result = '';
        readTemplate = fs.createReadStream(template, {encoding: 'utf8'});
        const rl = readline.createInterface({
            input: readTemplate,
            crlfDelay: Infinity
        });
        for await (const line of rl) {
            if (line.search(regEx) >= 0) {
                const component = line.slice(line.search(regEx) + 2, line.length - 2);
                for (const file of componentsFiles) {
                    if (path.basename(file, '.html') == component) {
                        const componentData = fs.createReadStream(
                            path.join(components, file),
                            {encoding: 'utf8'}
                        );
                        for await (const chunk of componentData) {
                            result += chunk;
                        }
                        componentData.close();
                        result += '\n';
                        break;
                    }
                }
            } else {
                result += `${line}\n`;
            }
        }
        rl.close();
        readTemplate.close();
        const writeIndexHtml = fs.createWriteStream(htmlRes, {encoding: 'utf-8'});
        writeIndexHtml.write(result);
        writeIndexHtml.close();
    } catch(err) {
        console.log(err);
    }
}

createBundle();
