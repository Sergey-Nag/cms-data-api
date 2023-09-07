const DataManagerService = require('./DataManagerService');
const isEmpty = require('lodash/isEmpty');
const DataFilter = require('./dataSearch/DataFilter');
const DataFinder = require('./dataSearch/DataFinder');

module.exports = class RepositoryService {
    constructor(dataName) {
        this.dataManager = new DataManagerService(dataName);
        this.data = null;
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
        console.log({data});
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
    exist(queryData) {
        return !!this.#find(queryData);
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
        this.data = await this.dataManager.load();
    }

    async save() {
        await this.dataManager.save(this.data);
    }
}