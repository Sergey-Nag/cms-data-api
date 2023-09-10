const CreatableModel = require('../baseModels/CreateableModel');

const defaultPermissions = {
    analytics: false,
    products: false,
    orders: false,
    pages: false,
    users: false,
}

class User extends CreatableModel {
    constructor({ id, firstname, lastname, createdISO, lastModifiedISO, createdById, email, permissions }, createdByIdInitital = null) {
        super({
            id, 
            createdById: createdByIdInitital ?? createdById, 
            createdISO
        }, 'U');

        this.firstname = firstname;
        this.email = email;
        this.lastname = lastname ?? null;
        this.lastModifiedISO = lastModifiedISO ?? null;

        this.permissions = {
            canSee: {
                ...defaultPermissions,
                ...permissions?.canSee,
            },
            canEdit: {
                ...defaultPermissions,
                ...permissions?.canEdit,
            },
            canDelete: {
                ...defaultPermissions,
                ...permissions?.canDelete,
            }
        }
    }

    update({ firstname, lastname, email, permissions }, modifiedById = null) {
        this.firstname = firstname ?? this.firstname;
        this.lastname = lastname ?? this.lastname;
        this.email = email ?? this.email;
        this.lastModifiedISO = new Date().toISOString();

        this.permissions = {
            canSee: {
                ...this.permissions?.canSee,
                ...permissions?.canSee,
            },
            canEdit: {
                ...this.permissions?.canEdit,
                ...permissions?.canEdit,
            },
            canDelete: {
                ...this.permissions?.canDelete,
                ...permissions?.canDelete,
            }
        };
    }
}

module.exports = User;
