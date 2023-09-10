const { PageRepository } = require("../../data/repositories");
const ApiErrorFactory = require("../../utils/ApiErrorFactory");

const validate = async (title, alias, id = null) => {
    const repo = new PageRepository();
    await repo.load();

    if (title) {
        const page = repo.get({ title }, true);
        if (page && page.id !== id) {
            throw ApiErrorFactory.pageAlreadyExists('title');
        }
    }

    if (alias) {
        const page = repo.get({ alias }, true);
        if (page && page.id !== id) {
            throw ApiErrorFactory.pageAlreadyExists('alias');
        }
    }
}

const addPageProtect = (fn) => {
    return async (parent, args, ...params) => {
        const { title, alias } = args;

        await validate(title, alias);

        return fn(parent, args, ...params);
    }
}

const editPageProtect = (fn) => {
    return async (parent, args, ...params) => {
        const { id, data } = args;

        await validate(data.title, data.alias, id);

        return fn(parent, args, ...params);
    }
}

module.exports = {
    addPageProtect,
    editPageProtect
}