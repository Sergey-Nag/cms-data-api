const { DEFAULT_PERMISSIONS } = require("../../../constants/defaults");
const UserCredentials = require("./Credentials");
const User = require("./User");

class Admin extends User {
    constructor({ permissions, _secret, ...data}, createdByIdInitital = null) {
        super(data, createdByIdInitital, 'A');

        this.permissions = {
            canSee: {
                ...DEFAULT_PERMISSIONS,
                ...permissions?.canSee,
            },
            canEdit: {
                ...DEFAULT_PERMISSIONS,
                ...permissions?.canEdit,
            },
            canDelete: {
                ...DEFAULT_PERMISSIONS,
                ...permissions?.canDelete,
            }
        }

        this._secret = new UserCredentials(_secret);
    }

    isOnline() {
        return true
    }

    async setPassword(password) {
        await this._secret.hashPassword(password);
    }

    update({ permissions, ...data }, modifiedById = null) {
        console.log(permissions, data);
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

        super.update(data, modifiedById);
    }
}

module.exports = Admin;