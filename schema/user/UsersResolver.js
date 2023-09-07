const UserValidator = require('../../data/validators/UserValidator');
const { UserRepository } = require('../../data/repositories');
const ApiErrorFactory = require('../../utils/ApiErrorFactory');

class UserResolver {
    static async get(parent, { actionUserId, ...data }) {
        const users = new UserRepository();
        await users.load();

        if (actionUserId) {
            new UserValidator(users.get({ id: actionUserId }))
                .canSee('users');
        }

        const user = users.get(data);
        new UserValidator(user);

        return user;
    }

    static async add(parent, { actionUserId, ...data }) {
        const users = new UserRepository();
        await users.load();

        if (actionUserId) {
            new UserValidator(users.get({ id: actionUserId }))
                .canEdit('users');
        }

        UserValidator.validateDataToCreate(data);

        const addedUser = users.add(data, actionUserId);
        await users.save();
        return addedUser;
    }

    static async getAll(parent = null, { actionUserId, ...queryData } = {}, context) {
        const users = new UserRepository();
        await users.load();
        
        if (actionUserId) {
            new UserValidator(users.get({ id: actionUserId }))
                .canSee('users');
        }

        return users.getAll(queryData);
    }

    static async edit(parent, { id, actionUserId, data }) {
        const users = new UserRepository();
        await users.load();

        if (actionUserId) {
            const actionUser = users.get({ id: actionUserId });
            new UserValidator(actionUser, actionUserId)
                .canEdit('users');
        }

        UserValidator.validateDataToEdit(data);

        new UserValidator(users.get({ id }), id);
        const updatedUser = users.edit(id, data);
        if (!updatedUser) {
            throw ApiErrorFactory.somethingWentWrong();
        }

        await users.save();
        return updatedUser;
    }

    static async delete(parent, { id, actionUserId }) {
        const users = new UserRepository();
        await users.load();

        if (actionUserId) {
            const actionUser = users.get({ id: actionUserId });
            new UserValidator(actionUser, actionUserId)
                .canDelete('users');
        }

        new UserValidator(users.get({ id }), id);
        const deletedUsers = users.delete(id);

        if (!deletedUsers) {
            throw ApiErrorFactory.somethingWentWrong();
        }

        await users.save();
        return deletedUsers[0];
    }
}

module.exports = UserResolver;
