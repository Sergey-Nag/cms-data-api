const UniqIdModel = require("../baseModels/UniqIdModel");

class PageEditableModel extends UniqIdModel {
    constructor({ id, createdById, modifiedById, createdISO, lastModifiedISO, ...data }, idPrefix) {
        super(id, idPrefix);
        this.createdById = createdById ?? null;
        this.createdISO = createdISO ?? new Date().toISOString();
        this.modifiedById = modifiedById ?? null;
        this.lastModifiedISO = lastModifiedISO ?? null;
    }

    update(modifiedById) {
        this.modifiedById = modifiedById;
        this.lastModifiedISO = new Date().toISOString();
    } 
}

module.exports = PageEditableModel;