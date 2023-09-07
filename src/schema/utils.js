const { readData } = require('../data');

const loadUserById = async (id) => {
    const users = await readData('users');
    return users.find((user) => user.id === id);
}

module.exports = {
    loadUserById,
};