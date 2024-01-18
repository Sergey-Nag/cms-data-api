const { isEmpty } = require("lodash");
const DataMutations = require("../data/dataMutations/DataMutations");
const DataFinder = require("../data/dataMutations/filter/DataFinder");
const DataFilter = require("../data/dataMutations/filter/DataFilter");

class DataResolver {
    constructor(repository, model, validator = null) {
        this.repository = repository;
        this.model = model;
        this.validator = validator;
    }

    async getAll(parent, { filter, sort, pagination } = {}) {
        await this.repository.load();
        
        const dataMutation = new DataMutations({ filter, sort, pagination }, true);
        let allData = this.repository.data.map((data) => new this.model(data));
        let totalItems = allData.length;

        if (parent) {
            const tempFilter = new DataFilter(parent, true);
            allData = tempFilter.filter(allData);
            totalItems = allData.length;
        }

        const result = dataMutation.mutate(allData);
        totalItems = dataMutation.itemsLengthAfterFilter;
        
        if (pagination) {
            return {...result, totalItems };
        }
        return { items: result, totalItems };
    }

    async get(parent, { find } = {}) {
        if (isEmpty(find)) return;

        await this.repository.load();

        const dataFinder = new DataFinder(find, true);
        
        const data = this.repository.data.map(d => new this.model(d));
        const result = dataFinder.find(data);

        if (!result) {
            this.validator?.dataNotFound();
        }

        return result;
    }

    async add(parent, { input } = {}, {actionUser} = {}) {
        this.validator?.validateDataToCreate(input);
        await this.repository.load();

        const newData = new this.model({...input, createdById: actionUser?.id });
        const addedData = this.repository.add(newData);
        
        await this.repository.save();
        return addedData;
    }

    async edit(parent, { id, input } = {}, {actionUser} = {}) {
        this.validator?.validateDataToEdit(input);
        await this.repository.load();

        const dataToUpdate = this.repository.data.find((data) => data.id === id);

        if (!dataToUpdate) {
            this.validator?.dataNotFound();
        }

        const updateData = new this.model(dataToUpdate);
        updateData.update(input, actionUser?.id);

        this.repository.update(id, updateData);
        await this.repository.save();
        return updateData;
    }

    async delete(parent, { ids } = {}, context) {
        await this.repository.load();

        const deletedData = ids.map((id) => {
            const result = this.repository.delete(id);

            if (!result) {
                this.validator?.dataNotFound();
            }

            return new this.model(result[0]);
        });

        await this.repository.save();
        return deletedData;
    }
}

module.exports = DataResolver;