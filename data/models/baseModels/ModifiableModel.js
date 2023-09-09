const CreatableModel = require("./CreateableModel");

class ModifiableModel extends CreatableModel {
    constructor({id, createdById, createdISO, modifiedById, lastModifiedISO}, idPrefix) {
        super({ id, createdById, createdISO }, idPrefix);

        this.modifiedById = modifiedById ?? null;
        this.lastModifiedISO = lastModifiedISO ?? null;
    }

    update(modifiedById) {
        this.modifiedById = modifiedById ?? this.modifiedById;
        this.lastModifiedISO = new Date().toISOString();
    }
}

module.exports = ModifiableModel;