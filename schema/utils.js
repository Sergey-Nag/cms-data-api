const { readData } = require('../data/index');
const ApiErrorFactory = require('../utils/ApiErrorFactory');

const loadUserById = async (id) => {
    const users = await readData('users');
    return users.find((user) => user.id === id);
}

const authProtect = (fn) => {
    return (...args) => {
        if (!args[2].actionUser) {
            throw ApiErrorFactory.unauthorized();
        }

        return fn(...args);
    }
}

module.exports = {
    loadUserById,
    authProtect,
};
