const User = require('./User');

class UserEditableModel extends User {
    constructor({ createdById, modifiedById, createdISO, lastModifiedISO, ...data }, idPrefix) {
        super(data, idPrefix);
        this.createdById = createdById ?? null;
        this.createdISO = createdISO ?? new Date().toISOString();
        this.modifiedById = modifiedById ?? null;
        this.lastModifiedISO = lastModifiedISO ?? null;
    }

    update({modifiedById, ...data}) {
        this.modifiedById = modifiedById;
        this.lastModifiedISO = new Date().toISOString();

        super.update(data);
    } 
}

module.exports = UserEditableModel;