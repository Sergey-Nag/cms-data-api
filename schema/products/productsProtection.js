const { PRODUCTS_REPO_NAME } = require("../../constants/repositoryNames");
const Repository = require("../../data/repositories/Repository");
const ApiErrorFactory = require("../../utils/ApiErrorFactory");

const validate = async (alias, id = null) => {
    const repo = new Repository(PRODUCTS_REPO_NAME);
    await repo.load();

    if (alias) {
        const prod = repo.get(p => p.alias === alias);
        if (prod && prod.id !== id) {
            throw ApiErrorFactory.productAlreadyExist('alias');
        }
    }
}

const addProductProtect = (fn) => {
    return async (parent, args, ...params) => {
        const { alias } = args.input;

        await validate(alias);

        return fn(parent, args, ...params);
    }
};

module.exports = {
    addProductProtect
}