const fs = require('fs/promises');
const path = require('path');

/**
 * Loads parsed json data
 * @param {string} filename 
 * @returns 
 */
async function readData(filename) {
    try {
        const filepath = path.join(__dirname, 'storage', `${filename}.json`);
        const data = await fs.readFile(filepath, "utf8");
        return JSON.parse(data);
    } catch(e) {
        console.error('READ_FILE', e);
    }
}

/**
 * Rewrite object data to file
 * @param {string} filename 
 * @param {any} data 
 */
async function writeData(filename, data) {
    try {
        const filepath = path.join(__dirname, 'storage', `${filename}.json`);

        await fs.writeFile(filepath, JSON.stringify(data, null, 4), 'utf-8');
    } catch(e) {
        console.error('WRITE_FILE', e);
    }
}


module.exports = {
    readData,
    writeData,
}
