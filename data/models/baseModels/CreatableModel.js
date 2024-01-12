class CreatableModel {
    constructor({ createdById, createdISO }) {
        this.createdById = createdById ?? null;
        this.createdISO = createdISO ?? new Date().toISOString();
    }

    update(modifiedById) {
        this.modifiedById = modifiedById;
        this.lastModifiedISO = new Date().toISOString();
    } 
}

module.exports = CreatableModel;