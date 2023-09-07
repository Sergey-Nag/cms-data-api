const UsersRepository = require("../../repositories/UsersRepository");
const UserSessionService = require("../../services/UserSessionService");
const UserValidator = require("../../validators/UserValidator");

module.exports = class UsersResolver {
    static async getAll(parent, queryData, { user: actionUser }) {
        const usersRepo = new UsersRepository();
        await usersRepo.load();

        if (actionUser) {
            new UserValidator(usersRepo)
                .canSee(actionUser.id, 'users');
        }

        return usersRepo.getAll(queryData);
    }

    static async get(parent, queryData, { user: actionUser }) { 
        const usersRepo = new UsersRepository();
        await usersRepo.load();

        if (actionUser) {
            new UserValidator(usersRepo)
                .canSee(actionUser.id, 'users');
        }

        return usersRepo.get(queryData);
    }

    static async add(parent, queryData, context) {

    }
    static async edit(parent, queryData, context) {

    }
    static async delete(parent, queryData, context) {}

    static async createdBy({ createdById }, args, context) {
        return createdById && await UsersResolver.get(undefined, { id: createdById }, context);
    }

    static isOnline({ id }) {
        const usersSession = UserSessionService.getInstance();
    
        return usersSession.isOnline(id);
    }
}