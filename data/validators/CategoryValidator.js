const isNil = require("lodash/isNil");
const ApiErrorFactory = require("../../utils/ApiErrorFactory");
const isKebabCase = require("../../utils/isKebabCase");

class CategoryValidator {
    static validateDataToCreate({ alias }) {
        !isNil(alias) && this.#validateAlias(alias);
    }

    static validateDataToEdit({ alias }) {
        !isNil(alias) && this.#validateAlias(alias);
    }

    static #validateAlias(alias) {
        const testAlias = alias.trim();

        if (!isKebabCase(testAlias)) {
            throw ApiErrorFactory.pageAliasInvalid(testAlias);
        }
    }

    static dataNotFound() {
        throw ApiErrorFactory.categoryNotFound();
    }
}


module.exports = CategoryValidator;
