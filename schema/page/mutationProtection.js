const { PAGES_REPO_NAME } = require("../../constants/repositoryNames");
const { PageRepository } = require("../../data/repositories");
const Repository = require("../../data/repositories/Repository");
const ApiErrorFactory = require("../../utils/ApiErrorFactory");

const validate = async (title, alias, id = null) => {
    const repo = new Repository(PAGES_REPO_NAME);
    await repo.load();

    if (title) {
        const page = repo.get(p => p.title === title);
        if (page && page.id !== id) {
            throw ApiErrorFactory.pageAlreadyExists('title');
        }
    }

    if (alias) {
        const page = repo.get(p => p.alias === alias);
        if (page && page.id !== id) {
            throw ApiErrorFactory.pageAlreadyExists('alias');
        }
    }
}

const addPageProtect = (fn) => {
    return async (parent, args, ...params) => {
        const { title, alias } = args.input;

        await validate(title, alias);

        return fn(parent, args, ...params);
    }
}

const editPageProtect = (fn) => {
    return async (parent, args, ...params) => {
        const { id, input } = args;

        await validate(input.title, input.alias, id);

        return fn(parent, args, ...params);
    }
}

module.exports = {
    addPageProtect,
    editPageProtect
}