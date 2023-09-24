const { ADMINS_REPO_NAME } = require("../../constants/repositoryNames");
const Repository = require("../../data/repositories/Repository");
const ApiErrorFactory = require("../../utils/ApiErrorFactory");

const validate = async (email, id = null) => {
    const repo = new Repository(ADMINS_REPO_NAME);
    await repo.load();

    if (email) {
        const user = repo.get(u => u.email === email);
        if (user && user.id !== id) {
            throw ApiErrorFactory.userAlreadyExists('email');
        }
    }
}

const addAdminProtect = (fn) => {
    return async (parent, args, ...params) => {
        const { email } = args.input;
        
        await validate(email);
        
        return fn(parent, args, ...params);
    }
}

const editAdminProtect = (fn) => {
    return async (parent, args, ...params) => {
        const { id, input } = args;

        await validate(input.email, id);

        return fn(parent, args, ...params);
    }
}

module.exports = {
    addAdminProtect,
    editAdminProtect
}