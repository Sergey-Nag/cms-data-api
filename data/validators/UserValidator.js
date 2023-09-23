const { isNil } = require("lodash");
const ApiErrorFactory = require("../../utils/ApiErrorFactory");
const isEmailValid = require("../../utils/isEmailValid");
/**
 * @typedef {'analytics' | 'products' | 'orders' | 'pages' | 'users'} Destionation
 */


class UserValidator {
    static validateDataToCreate(data) {
        const {firstname, email} = data ?? {};

        this.#validateFirstname(firstname);
        this.#validateEmail(email);
    }

    static validateDataToEdit(data) {
        const {firstname, email} = data ?? {};

        !isNil(firstname) && this.#validateFirstname(firstname);
        !isNil(email) && this.#validateEmail(email);
    }

    static #validateEmail(email) {
        const testEmail = email?.trim();
        if (!testEmail || !isEmailValid(testEmail)) {
            throw ApiErrorFactory.userEmailInvalid();
        }
    }
    static #validateFirstname(firstname) {
        const testFirstname = firstname?.trim();
        if (!testFirstname || testFirstname.length < 2) {
            throw ApiErrorFactory.userFirstnameInvalid();
        }
    }

    static dataNotFound() {
        throw ApiErrorFactory.userNotFound();
    }

    constructor(user, dest) {
        if (!user) {
            throw ApiErrorFactory.userNotFound();
        }

        this.dest = dest;
        const { permissions } = user;
        this._canDelete = permissions?.canDelete ?? {};
        this._canSee = permissions?.canSee ?? {};
        this._canEdit = permissions?.canEdit ?? {};
    }

    /**
     * @param {Destionation} dest
     */
    canSee(dest) {
        if (!this._canSee[dest]) {
            throw ApiErrorFactory.actionForbidden();
        }
        return this;
    }

    /**
     * @param {Destionation} dest
     */
    canEdit(dest) {
        if (!this._canEdit[dest]) {
            throw ApiErrorFactory.actionForbidden();
        }
        return this;
    }

    /**
     * @param {Destionation} dest
     */
    canDelete(dest) {
        if (!this._canDelete[dest]) {
            throw ApiErrorFactory.actionForbidden();
        }
        return this;
    }
}


module.exports = UserValidator;
