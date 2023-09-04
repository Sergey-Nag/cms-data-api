const ApiErrorFactory = require("../../utils/ApiErrorFactory");

class UserPermissionsValidator {
    constructor(canKey, value) {
        this.canKey = canKey;
        this.value = value;
    }

    isValid(user) {
        if (user.permissions[this.canKey] !== this.value) {
            throw ApiErrorFactory.actionForbidden();
        }
    }
}

module.exports = UserPermissionsValidator;