const UserEditableModel = require('../baseModels/UserEditableModel');
const CreatableModel = require('../baseModels/UserEditableModel');

class User extends UserEditableModel {
    constructor({ firstname, lastname, email, createdById, ...data }, createdByIdInitital = null, idPrefix = null) {
        super({
            ...data,
            createdById: createdByIdInitital ?? createdById,
        }, idPrefix);

        this.firstname = firstname;
        this.lastname = lastname ?? null;
        this.email = email;
    }

    update({ firstname, lastname, email }, modifiedById = null) {
        this.firstname = firstname ?? this.firstname;
        this.lastname = lastname ?? this.lastname;
        this.email = email ?? this.email;

        super.update(modifiedById);
    }
}

module.exports = User;
