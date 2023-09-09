const UniqIdModel = require('./UniqIdModel');

class CreatableModel extends UniqIdModel {
    constructor({ id, createdById, createdISO }, idPrefix) {
        super(id, idPrefix);
        this.createdById = createdById ?? null;
        this.createdISO = createdISO ?? new Date().toISOString();
    }
}

module.exports = CreatableModel;