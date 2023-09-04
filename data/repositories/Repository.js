const isEmpty = require('lodash/isEmpty');
const { readData, writeData } = require('..');
const DataFilter = require('../filter/DataFilter');
const DataFinder = require('../filter/DataFinder');

class Repository {
    constructor(dataName) {
        this.dataName = dataName;
        this.data = [];
    }
    getAll(queryData) {
        if (isEmpty(queryData)) return this.data;
        return this.#filter(queryData);
    }
    get(queryData) {
        if (isEmpty(queryData)) return false;
        return this.#find(queryData);
    }
    add(data) {
        this.data.push(data);
        return data;
    }
    delete(id) {
        const index = this.data.findIndex(data => data.id === id);

        if (index === -1) return false;

        const deletedData = this.data.splice(index, 1);
        return deletedData;
    }
    edit(id, data) {
        const index = this.data.findIndex(data => data.id === id);

        if (index === -1) return false;

        this.data[index] = data;

        return data;
    }
    exist(id) {
        return this.data.findIndex((data) => data.id === id) !== -1;
    }

    #filter(queryOptions) {
        const dataFilter = new DataFilter(queryOptions);
        const filteredData = dataFilter.find(this.data);
        return filteredData;
    }

    #find(queryOptions) {
        const dataFinder = new DataFinder(queryOptions);
        const foundData = dataFinder.find(this.data);
        return foundData;
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
