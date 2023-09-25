const UniqIdModel = require('../baseModels/UniqIdModel');

class User extends UniqIdModel {
    constructor({ id, firstname, lastname, email }, idPrefix = 'U') {
        super(id, idPrefix);

        this.firstname = firstname ?? null;
        this.lastname = lastname ?? null;
        this.email = email;
    }

    update({ firstname, lastname, email }) {
        this.firstname = firstname ?? this.firstname;
        this.lastname = lastname ?? this.lastname;
        this.email = email ?? this.email;
    }
}

module.exports = User;
