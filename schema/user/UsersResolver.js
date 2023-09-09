const UserValidator = require('../../data/validators/UserValidator');
const { UserRepository, UserCredentialsRepository } = require('../../data/repositories');
const ApiErrorFactory = require('../../utils/ApiErrorFactory');
const UserRegistrationService = require('../../services/UserRegistrationService');
const SessionManager = require('../../managers/SessionManager');

class UserResolver {
    static async get(parent, data,  { actionUserId }) {
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

    static async add(parent, data, {actionUserId}) {
        if (!actionUserId) {
            throw ApiErrorFactory.authorizationTokenWasntProvided();
        }
        const users = new UserRepository();
        await users.load();

        new UserValidator(users.get({ id: actionUserId }))
            .canEdit('users');

        UserValidator.validateDataToCreate(data);

        const addedUser = users.add(data, actionUserId);
        
        const passw = await UserRegistrationService.createPasswordForUser(addedUser);
        console.log(passw);
        await users.save();
        return addedUser;
    }

    static async getAll(parent = null, queryData = {}, { actionUserId }) {
        const users = new UserRepository();
        await users.load();

        if (actionUserId) {
            new UserValidator(users.get({ id: actionUserId }))
                .canSee('users');
        }

        return users.getAll(queryData);
    }

    static async edit(parent, { id, data }, { actionUserId }) {
        if (!actionUserId) {
            throw ApiErrorFactory.authorizationTokenWasntProvided();
        }
        const users = new UserRepository();
        await users.load();

        const actionUser = users.get({ id: actionUserId });
        new UserValidator(actionUser, actionUserId)
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

    static async delete(parent, { id }, {actionUserId}) {
        if (!actionUserId) {
            throw ApiErrorFactory.authorizationTokenWasntProvided();
        }
        const users = new UserRepository();
        await users.load();

        const actionUser = users.get({ id: actionUserId });
        new UserValidator(actionUser, actionUserId)
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
    
        console.log(session);
        if (!session) return false;

        const decodedAccessToken = sesisonManager.verifyAccessToken(session.accessToken);

        return !sesisonManager.isTokenExpired(decodedAccessToken);
    }
}

module.exports = UserResolver;
