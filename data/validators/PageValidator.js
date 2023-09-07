const words = require("lodash/words");
const ApiErrorFactory = require("../../utils/ApiErrorFactory");
const isKebabCase = require("../../utils/isKebabCase");
const isNil = require("lodash/isNil");
const { GraphQLError } = require("graphql");

class PageValidatior {
    static validateDataToCreate(data) {
        const { path, alias, title } = data ?? {};

        this.#validatePath(path);
        this.#validateTitle(title);
        !isNil(alias) && this.#validateAlias(alias);
    }
    static validateDataToEdit(data) {
        const { path, alias, title } = data ?? {};

        !isNil(path) && this.#validatePath(path);
        !isNil(title) && this.#validateTitle(title);
        !isNil(alias) && this.#validateAlias(alias);
    }

    static #validateAlias(alias) {
        const testAlias = alias.trim();

        if (!isKebabCase(testAlias)) {
            throw ApiErrorFactory.pageAliasInvalid(testAlias);
        }
    }
    static #validateTitle(title) {
        const testTitle = title.trim();

        if (testTitle.length < 2) {
            throw ApiErrorFactory.pageTitleToShort();
        }
    }
    static #validatePath(path) {
        const testPath = path.map(p => p.trim()).filter((p) => !!p);

        if (testPath.length === 0) {
            throw ApiErrorFactory.pagePathIsEmpty();
        } else if (!testPath.every(isKebabCase)) {
            throw ApiErrorFactory.pagePathIsNotValid();
        }
    }
}

module.exports = PageValidatior;
