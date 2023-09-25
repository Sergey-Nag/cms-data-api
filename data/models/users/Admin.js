const { DEFAULT_PERMISSIONS } = require("../../../constants/defaults");
const SessionManager = require("../../../managers/SessionManager");
const UserEditableModel = require("./UserEditableModel");
const UserCredentials = require("./Credentials");

class Admin extends UserEditableModel {
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
        const session = new SessionManager();
        return !!session.getSession(this.id);
    }

    async setPassword(password) {
        try {
            await this._secret.hashPassword(password);
            return true;
        } catch(e) {
            return false;
        }
    }

    async isPasswordValidAsync(password) {
        return await this._secret.isPasswordValidAsync(password);
    }

    update({ permissions, ...data }, modifiedById = null) {
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

        super.update({modifiedById, ...data});
    }
}

module.exports = Admin;