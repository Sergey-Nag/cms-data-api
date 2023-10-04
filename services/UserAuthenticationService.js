const ApiErrorFactory = require('../utils/ApiErrorFactory');
const isEmailValid = require('../utils/isEmailValid');
const { ADMIN_EMAIL } = require('../constants/env');
const { PASSWORD_VALIDATION_REGEXP } = require('../constants/regexp');
const Repository = require('../data/repositories/Repository');
const { ADMINS_REPO_NAME } = require('../constants/repositoryNames');
const Admin = require('../data/models/users/Admin');
const SessionManager = require('../managers/SessionManager');

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
        if (typeof password !== 'string' || password.length === 0) {
            throw ApiErrorFactory.userPasswordInvalid();
        }

        const repo = new Repository(ADMINS_REPO_NAME);
        await repo.load();

        const user = repo.data.find((admin) => admin.email === email);

        if (!user) {
            throw ApiErrorFactory.userCredentialsInvalid();
        }

        const admin = new Admin(user);

        if (!(await admin.isPasswordValidAsync(password))) {
            throw ApiErrorFactory.userCredentialsInvalid();
        }

        return admin;
    }
    static async logoutUser(userId) {
        if (!userId) {
            return ApiErrorFactory.unauthorized();
        }

        const sessions = new SessionManager();
        if (!sessions.getSession(userId)) {
            throw ApiErrorFactory.unauthorized();
        }

        sessions.endSession(userId);
    }
    static async updatePassword(userId, newPassword) {
        this.#validatePasword(newPassword);
        const repo = new Repository(ADMINS_REPO_NAME);
        await repo.load();
        const user = repo.get(({ id }) => id === userId);

        const admin = new Admin(user);

        const updated = await admin.setPassword(newPassword);
        repo.update(userId, admin);
        await repo.save();
        return !!updated;
    }
}