const { readData, writeData } = require('..');

class Repository {
    constructor(dataName) {
        this.dataName = dataName;
        this.data = [];
    }
    getAll() {
        return this.data;
    }
    get(find) {
        return this.data.find(find) ?? null;
    }
    add(data) {
        this.data.push(data);
        return data;
    }
    delete(id) {
        const index = this.data.findIndex(data => data.id === id);

        if (index === -1) return null;

        const deletedData = this.data.splice(index, 1);
        return deletedData;
    }
    update(id, data) {
        const index = this.data.findIndex(data => data.id === id);

        if (index === -1) return false;

        this.data[index] = data;

        return data;
    }
    exist(id) {
        return this.data.findIndex((data) => data.id === id) !== -1;
    }

    async load() {
        this.data = await this.#getData();
    }

    async save() {
        await this.#setData(this.data);
    }

    async #getData() {
        return await readData(this.dataName);
    }
    async #setData(data) {
        await writeData(this.dataName, data);
    }
};

module.exports = Repository;
