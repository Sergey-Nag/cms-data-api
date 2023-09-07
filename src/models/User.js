const BaseDataModel = require('./base/BaseDataModel');

const defaultPermissions = {
    analytics: false,
    products: false,
    orders: false,
    pages: false,
    users: false,
}

module.exports = class User extends BaseDataModel {
    constructor({ id, firstname, lastname, createdISO, lastModifiedISO, createdById, email, permissions }) {
        super(id, 'U');
        this.createdISO = createdISO ?? new Date().toISOString();

        this.firstname = firstname;
        this.lastname = lastname ?? null;
        this.email = email;
        this.createdById = createdById || null ;
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

    update({ firstname, lastname, email, permissions }) {
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

    static create(data) {
        return new User(data);
    }
}
