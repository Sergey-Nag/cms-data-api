class DataService {
    constructor(repository) {
        this.repository = repository;
    }

    async getAll(queryData) {
        await this.repository.load();

        return this.repository.getAll(queryData);
    }
}

module.exports = DataService;