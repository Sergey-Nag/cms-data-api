const uniqid = require('uniqid');
const { ADMIN_PASSWORD, ADMIN_ID, ADMIN_EMAIL } = require('../constants/env');
const { PASSWORD_VALIDATION_REGEXP } = require('../constants/regexp');
const Repository = require('../data/repositories/Repository');
const { ADMINS_REPO_NAME } = require('../constants/repositoryNames');
const Admin = require('../data/models/users/Admin');

class UserRegistrationService {
    static generatePassword() {
        let password = uniqid.time();

        if (!PASSWORD_VALIDATION_REGEXP.test(password)) {
            password = this.generatePassword();
        }

        return password;
    }
    static async isAdminUserExist() {
        const repo = new Repository(ADMINS_REPO_NAME);
        await repo.load();

        const admin = repo.data.find(({ id }) => id === ADMIN_ID );

        return !!admin;
    }
    static async createAdminUser() {
        const repo = new Repository(ADMINS_REPO_NAME);
        await repo.load();

        const admin = new Admin({
            id: ADMIN_ID,
            firstname: 'Admin',
            email: ADMIN_EMAIL,
            permissions: {
                canSee: {
                    analytics: true,
                    pages: true,
                    products: true,
                    admins: true,
                    customers: true,
                    orders: true,
                },
                canEdit: {
                    analytics: true,
                    pages: true,
                    products: true,
                    admins: true,
                    customers: true,
                    orders: true,
                },
                canDelete: {
                    analytics: true,
                    pages: true,
                    products: true,
                    admins: true,
                    customers: true,
                    orders: true,
                },
            }
        });

        repo.data.unshift(admin);

        await admin.setPassword(ADMIN_PASSWORD);

        await repo.save();
    }
}

module.exports = UserRegistrationService;