const UserValidator = require('../../data/validators/UserValidator');
const { UserRepository } = require('../../data/repositories');
const ApiErrorFactory = require('../../utils/ApiErrorFactory');
/**
 * Get page by id
 * @param {any | undefined} parent 
 * @param {{ actionUserId?: string queryData: Partial<User> }} args 
 * @returns {Promise<User>}
 */
async function getUserResolve(parent, { actionUserId, ...data }) {
    const users = new UserRepository();
    await users.load();

    if (actionUserId) {
        new UserValidator(users.get({id: actionUserId}), actionUserId)
            .canSee('users');
    }

    const user = users.get(data);
    new UserValidator(user, data.id);

    return user;
};

async function addUserResolve(parent, { actionUserId, ...data}) {
    const users = new UserRepository();
    await users.load();

    if (actionUserId) {
        new UserValidator(users.get({id: actionUserId}), actionUserId)
            .canEdit('users');
    }

    UserValidator.validateDataToCreate(data);

    const addedUser = users.add(data, actionUserId);
    await users.save();
    return addedUser;
}

/**
 * @returns {Promise<User[]>}
 */
async function getAllUsersResolve(parent = null, { actionUserId, ...queryData } = {}) {
    const users = new UserRepository();
    await users.load();

    if (actionUserId) {
        new UserValidator(users.get({id: actionUserId}), actionUserId)
            .canSee('users');
    }

    return users.getAll(queryData);
}

async function editUserResolve(parent, {id, actionUserId, data}) {
    const users = new UserRepository();
    await users.load();

    if (actionUserId) {
        const actionUser = users.get({id: actionUserId});
        new UserValidator(actionUser, actionUserId)
            .canEdit('users');
    }

    UserValidator.validateDataToEdit(data);
    
    new UserValidator(users.get({id}), id);
    const updatedUser = users.edit(id, data);
    if (!updatedUser) {
        throw ApiErrorFactory.somethingWentWrong();
    }

    await users.save();
    return updatedUser;
}

/**
 * 
 * @param {*} parent 
 * @param {{ id: string, actionUserId: string}} args 
 *  id - id of user to be deleted, 
 *  actionUserId - id of user that performed the call 
 */
async function deleteUserResolve(parent, { id, actionUserId }) {
    const users = new UserRepository();
    await users.load();

    if (actionUserId) {
        const actionUser = users.get({id: actionUserId});
        new UserValidator(actionUser, actionUserId)
            .canDelete('users');    
    }

    new UserValidator(users.get({id}), id);
    const deletedUsers = users.delete(id);

    if (!deletedUsers) {
        throw ApiErrorFactory.somethingWentWrong();
    }

    await users.save();
    return deletedUsers[0];
}


module.exports = {
    getAllUsersResolve,
    getUserResolve,
    addUserResolve,
    editUserResolve,
    deleteUserResolve,
}