const { ORDERS_REPO_NAME } = require("../../constants/repositoryNames");
const Repository = require("../../data/repositories/Repository");
const ApiErrorFactory = require("../../utils/ApiErrorFactory");

const validate = async (id) => {
    const repo = new Repository(ORDERS_REPO_NAME);
    await repo.load();

    const orderToEdit = repo.get(o => o.id === id);

    if (!orderToEdit) {
        throw ApiErrorFactory.orderNotFound();
    }
}

const editOrderProtection = (fn) => {
    return async (parent, args, ...params) => {
        const { id, input } = args;

        await validate(id);

        return fn(parent, args, ...params);
    }
}

module.exports = {
    editOrderProtection
}