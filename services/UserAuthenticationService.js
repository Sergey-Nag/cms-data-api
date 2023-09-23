const UserCredentialsRepository = require('../data/repositories/UserCredentialsRepository');
const { UserRepository } = require('../data/repositories');
const ApiErrorFactory = require('../utils/ApiErrorFactory');
const isEmailValid = require('../utils/isEmailValid');
const { ADMIN_EMAIL } = require('../constants/env');
const { PASSWORD_VALIDATION_REGEXP } = require('../constants/regexp');

module.exports = class UserAuthenticationService {
    static #validateEmail(email) {
        if (email === ADMIN_EMAIL) return;

        if (typeof email !== 'string' || !isEmailValid(email)) {
            throw ApiErrorFactory.userEmailInvalid()
        }
    }
    static #validatePasword(password) {
        if (
            typeof password !== 'string' ||
            !PASSWORD_VALIDATION_REGEXP.test(password)
        ) {
            throw ApiErrorFactory.userPasswordInvalid();
        }
    }
    static async authenticateUser(email, password) {
        this.#validateEmail(email);
        this.#validatePasword(password);

        const credsRepo = new UserCredentialsRepository();
        const usersRepo = new UserRepository();

        await credsRepo.load();
        await usersRepo.load();

        const user = usersRepo.get({ email });

        if (!user) {
            throw ApiErrorFactory.userCredentialsInvalid();
        }

        const userCreds = credsRepo.get({ id: user.id });

        if (!userCreds) {
            throw ApiErrorFactory.somethingWentWrong();
        }

        if (!(await userCreds.isPasswordValidAsync(password))) {
            throw ApiErrorFactory.userCredentialsInvalid();
        }

        return user;
    }
    static async logoutUser(userId) {
        if (!userId) {
            return ApiErrorFactory.unauthorized();
        }

        const usersRepo = new UserRepository();
        await usersRepo.load();

        const user = usersRepo.get({ id: userId });
        if (!user) {
            throw ApiErrorFactory.userNotFound(userId);
        }
    }
    static async updatePassword(userId, newPassword) {
        this.#validatePasword(newPassword);
        const credsRepo = new UserCredentialsRepository();
        await credsRepo.load();
        
        const updated = await credsRepo.editAsync(userId, newPassword);
        
        await credsRepo.save();
        return !!updated;
    }
}