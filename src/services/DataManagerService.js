const { mkdir, readFile, writeFile, access } = require('fs/promises');
const path = require('path');

module.exports = class DataManagerService {
    constructor(filename) {
        this.filename = filename;
        this.filepath = path.join(__dirname, '..', '..', 'storage', `${this.filename}.json`);
    }

    async load() {
        try {
            await this.#ensureDataFileExists();

            const data = await readFile(this.filepath, "utf8");
            return JSON.parse(data);
        } catch(e) {
            console.error('READ_FILE', e);
        }
    }

    async save(data) {
        try {
            await mkdir(path.dirname(this.filepath), { recursive: true });
    
            return await writeFile(this.filepath, JSON.stringify(data, null, 4), 'utf-8');
        } catch(e) {
            console.error('WRITE_FILE', e); 
        }
    }


    async #ensureDataFileExists() {
        try {
            await access(this.filepath);
        } catch (e) {
            await this.save([]);
        }
    }
}