const { UserRepository } = require("../../data/repositories");
const ApiErrorFactory = require("../../utils/ApiErrorFactory");

const validate = async (email, id = null) => {
    const repo = new UserRepository();
    await repo.load();

    if (email) {
        const user = repo.get({ email }, true);
        if (user && user.id !== id) {
            throw ApiErrorFactory.userAlreadyExists('email');
        }
    }
}

const addUserProtect = (fn) => {
    return async (parent, args, ...params) => {
        const { email } = args;
        
        await validate(email);
        
        return fn(parent, args, ...params);
    }
}

const editUserProtect = (fn) => {
    return async (parent, args, ...params) => {
        const { id, data } = args;

        await validate(data.email, id);

        return fn(parent, args, ...params);
    }
}

module.exports = {
    addUserProtect,
    editUserProtect
}