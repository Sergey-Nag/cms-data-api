const { isNil } = require("lodash");
const ApiErrorFactory = require("../../utils/ApiErrorFactory");
const isEmailValid = require("../../utils/isEmailValid");
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
}


module.exports = UserValidator;
