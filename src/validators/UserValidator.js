const ApiValidationErrors = require("../ApiValidationErrors");

module.exports = class UserValidator {
    constructor(repository) {
        this.repository = repository;
    }

    canSee(id, destintation) {
        const user = this.repository.get({ id });

        if (!user?.permissions?.canSee[destintation]) {
            throw ApiValidationErrors.actionForbidden();
        }
        return this;
    }
    canEdit(id, destintation) {
        const user = this.repository.get({ id });

        if (!user?.permissions?.canEdit[destintation]) {
            throw ApiValidationErrors.actionForbidden();
        }
        return this;
    }
    canDelete(id, destintation) {
        const user = this.repository.get({ id });

        if (!user?.permissions?.canDelete[destintation]) {
            throw ApiValidationErrors.actionForbidden();
        }
        return this;
    }

    validate(firstname, email, password) {
        UserValidator.validateUser(firstname, email);

        if (!this.isPaswordValid(password)) {
            throw ApiValidationErrors.userAuthCredentialsWrong();
        }

        if (this.repository.exist({ email })) {
            throw ApiValidationErrors.userWithSameEmailExist();
        }
    }

    isPaswordValid(password) {
        return password && password.length > 3;
    }

    static validateEmail(email) {
        // Use a regular expression to validate the email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validateFirstname(firstname) {
        // Check if the firstname is not empty and is a string
        return typeof firstname === 'string' && firstname.trim() !== '';
    }

    static validateUser(firstname, email) {
        // if (!user || typeof user !== 'object') {
        //     throw new Error('Invalid user object');
        // }
        if (!UserValidator.validateFirstname(firstname)) {
            throw new Error('Invalid firstname');
        }

        if (!UserValidator.validateEmail(email)) {
            throw new Error('Invalid email address');
        }

    }
}