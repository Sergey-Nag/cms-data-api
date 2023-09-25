const { isEmpty } = require("lodash");
const DataMutations = require("../data/dataMutations/DataMutations");
const DataFinder = require("../data/dataMutations/filter/DataFinder");

class DataResolver {
    constructor(repository, model, validator) {
        this.repository = repository;
        this.model = model;
        this.validator = validator;
    }

    async getAll(parent, { filter, sort, pagination } = {}, context) {
        await this.repository.load();
        const dataMutation = new DataMutations({ filter, sort, pagination }, true);
        const allData = this.repository
        .data
        .map((data) => new this.model(data));
        
        const result = dataMutation.mutate(allData);
        
        if (pagination) {
            return result;
        }
        return { items: result };
    }

    async get(parent, { find } = {}, context) {
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

    async delete(parent, { id } = {}, context) {
        await this.repository.load();

        const result = this.repository.delete(id);

        if (!result) {
            this.validator?.dataNotFound();
        }

        await this.repository.save();
        return new this.model(result[0]);
    }
}

module.exports = DataResolver;