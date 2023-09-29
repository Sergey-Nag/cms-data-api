const UniqIdModel = require("./UniqIdModel");

class EditableModel extends UniqIdModel {
    constructor({ id, createdById, modifiedById, createdISO, lastModifiedISO }, idPrefix) {
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

module.exports = EditableModel;