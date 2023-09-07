const UserCredentialsRepository = require('../data/repositories/UserCredentialsRepository');
const { UserRepository } = require('../data/repositories');
const ApiErrorFactory = require('../utils/ApiErrorFactory');
const isEmailValid = require('../utils/isEmailValid');

module.exports = class UserAuthenticationService {
    static #validateEmail(email) {
        if (typeof email !== 'string' || !isEmailValid(email)) {
            throw ApiErrorFactory.userEmailInvalid()
        }
    }
    static #validatePasword(password) {
        if (typeof password !== 'string' || password.length < 2) {
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
}