const { readData } = require("../data");
const ApiErrorFactory = require('./ApiErrorFactory');

/**
 * Async validation factory that throws an error in case validation doesn't pass
 */
module.exports = class ApiValidationFactory {
    static canDeleteUsers(user) {
        if (!user?.permissions?.canDelete?.users) {
            throw ApiErrorFactory.actionForbidden();
        }
        return this;
    }
    static canSeeUsers(user) {
        if (!user?.permissions?.canSee?.users) {
            throw ApiErrorFactory.actionForbidden();
        }
        return this;
    }
    static canEditUsers(user) {
        if (!user?.permissions?.canEdit?.users) {
            throw ApiErrorFactory.actionForbidden();
        }
        return this;
    }

    static canDeletePages(user) {
        if (!user?.permissions?.canDelete?.pages) {
            throw ApiErrorFactory.actionForbidden();
        }
        return this;
    }
    static canSeePages(user) {
        if (!user?.permissions?.canSee?.pages) {
            throw ApiErrorFactory.actionForbidden();
        }
        return this;
    }
    static canEditPages(user) {
        if (!user?.permissions?.canEdit?.pages) {
            throw ApiErrorFactory.actionForbidden();
        }
        return this;
    }
    
    static userExists(user, id) {
        if (!user) {
            throw ApiErrorFactory.userNotFound(id);
        }
        return this;
    }
    static pageExists(id) {
        if (!id) {
            throw ApiErrorFactory.pageNotFound(id);
        }
        return this;
    }
}
