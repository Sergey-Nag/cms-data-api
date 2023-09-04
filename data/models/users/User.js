const uniqId = require('uniqid');

const defaultPermissions = {
    analytics: false,
    products: false,
    orders: false,
    pages: false,
    users: false,
}

class User {
    #actionUserId = null;
    constructor({ id, firstname, lastname, createdISO, lastModifiedISO, createdById, email, permissions, isOnline }, actionUserId) {
        this.#actionUserId = actionUserId;

        this.id = id ?? uniqId('U');
        this.createdISO = createdISO ?? new Date().toISOString();

        this.firstname = firstname;
        this.lastname = lastname ?? null;
        this.email = email;
        this.isOnline = isOnline ?? false;
        this.createdById = id ? createdById ?? null : actionUserId ?? null;
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

    update({ firstname, lastname, email, isOnline, permissions }) {
        this.firstname = firstname ?? this.firstname;
        this.lastname = lastname ?? this.lastname;
        this.email = email ?? this.email;
        this.isOnline = isOnline ?? this.isOnline;
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
