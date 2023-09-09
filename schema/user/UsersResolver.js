const UserValidator = require('../../data/validators/UserValidator');
const { UserRepository, UserCredentialsRepository } = require('../../data/repositories');
const ApiErrorFactory = require('../../utils/ApiErrorFactory');
const UserRegistrationService = require('../../services/UserRegistrationService');
const SessionManager = require('../../managers/SessionManager');

class UserResolver {
    static async get(parent, data,  { actionUser }) {
        const users = new UserRepository();
        await users.load();

        new UserValidator(actionUser)
            .canSee('users');

        const user = users.get(data);
        new UserValidator(user);
        return user;
    }

    static async add(parent, data, {actionUser}) {
        const users = new UserRepository();
        await users.load();

        new UserValidator(actionUser)
            .canEdit('users');

        UserValidator.validateDataToCreate(data);

        const addedUser = users.add(data, actionUser.id);
        
        const passw = await UserRegistrationService.createPasswordForUser(addedUser);
        await users.save();
        return addedUser;
    }

    static async getAll(parent = null, queryData = {}, { actionUser }) {
        const users = new UserRepository();
        await users.load();

        new UserValidator(actionUser)
            .canSee('users');

        return users.getAll(queryData);
    }

    static async edit(parent, { id, data }, { actionUser }) {
        const users = new UserRepository();
        await users.load();

        new UserValidator(actionUser)
            .canEdit('users');

        UserValidator.validateDataToEdit(data);

        new UserValidator(users.get({ id }), id);
        const updatedUser = users.edit(id, data);
        if (!updatedUser) {
            throw ApiErrorFactory.somethingWentWrong();
        }

        await users.save();
        return updatedUser;
    }

    static async delete(parent, { id }, {actionUser}) {
        const users = new UserRepository();
        await users.load();

        new UserValidator(actionUser)
            .canDelete('users');

        new UserValidator(users.get({ id }), id);
        const deletedUsers = users.delete(id);

        if (!deletedUsers) {
            throw ApiErrorFactory.somethingWentWrong();
        }

        const creds = new UserCredentialsRepository();
        await creds.load();
        creds.delete(deletedUsers[0].id);

        await users.save();
        await creds.save();
        return deletedUsers[0];
    }

    static isOnline({id}) {
        const sesisonManager = new SessionManager()
        const session = sesisonManager.getSession(id);
    
        if (!session) return false;

        return sesisonManager.isSessionExpired(session);
    }
}

module.exports = UserResolver;
