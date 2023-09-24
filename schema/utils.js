const { DEFAULT_PERMISSIONS } = require('../constants/defaults');
const ApiErrorFactory = require('../utils/ApiErrorFactory');

const authProtect = (fn) => {
    return (...args) => {
        if (!args[2].actionUser) {
            throw ApiErrorFactory.unauthorized();
        }

        return fn(...args);
    }
}

/**
* @param {keyof DEFAULT_PERMISSIONS} permission - The permission key to check.
* @param {Function} fn - The function to execute if the permission check passes.
* @returns {Function} - A protected function that checks the permission before executing fn.
*/
const canEditProtect = (permission, fn) => {
    return (...args) => {
        if (args[2].actionUser && !args[2].actionUser.permissions.canEdit[permission]) {
            throw ApiErrorFactory.actionForbidden();
        }

        return fn(...args);
    }
}

/**
* @param {keyof DEFAULT_PERMISSIONS} permission - The permission key to check.
* @param {Function} fn - The function to execute if the permission check passes.
* @returns {Function} - A protected function that checks the permission before executing fn.
*/
const canSeeProtect = (permission, fn) => {
    return (...args) => {
        if (args[2].actionUser && !args[2].actionUser.permissions.canSee[permission]) {
            throw ApiErrorFactory.actionForbidden();
        }

        return fn(...args);
    }
}

/**
* @param {keyof DEFAULT_PERMISSIONS} permission - The permission key to check.
* @param {Function} fn - The function to execute if the permission check passes.
* @returns {Function} - A protected function that checks the permission before executing fn.
*/
const canDeleteProtect = (permission, fn) => {
    return (...args) => {
        if (args[2].actionUser && !args[2].actionUser.permissions.canDelete[permission]) {
            throw ApiErrorFactory.actionForbidden();
        }

        return fn(...args);
    }
}

module.exports = {
    authProtect,
    canSeeProtect,
    canEditProtect,
    canDeleteProtect,
};
