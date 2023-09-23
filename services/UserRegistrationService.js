const uniqid = require('uniqid');
const UserRepository = require("../data/repositories/UserRepository");
const UserCredentialsRepository = require('../data/repositories/UserCredentialsRepository');
const ApiErrorFactory = require("../utils/ApiErrorFactory");
const { ADMIN_PASSWORD, ADMIN_ID, ADMIN_EMAIL } = require('../constants/env');
const User = require('../data/models/users/User');
const { PASSWORD_VALIDATION_REGEXP } = require('../constants/regexp');

class UserRegistrationService {
    static generatePassword() {
        let password = uniqid();

        if (!PASSWORD_VALIDATION_REGEXP.test(password)) {
            password = this.generatePassword();
        }

        return password;
    }
    static async createPasswordForUser(user) {
        if (!user) {
            throw ApiErrorFactory.somethingWentWrong();
        }
        const credsRepo = new UserCredentialsRepository();
        await credsRepo.load();


        const password = this.generatePassword();
        const userCreds = await credsRepo.addAsync(user, password);

        if (!userCreds || !(await userCreds.isPasswordValidAsync(password))) {
            throw ApiErrorFactory.somethingWentWrong();
        }

        await credsRepo.save();
        return password;
    }
    static async isAdminUserExist() {
        const usersRepo = new UserRepository();
        await usersRepo.load();

        const admin = usersRepo.get({ id: ADMIN_ID, });

        return !!admin;
    }
    static async createAdminUser() {
        const usersRepo = new UserRepository();
        const credsRepo = new UserCredentialsRepository();
        await usersRepo.load();
        await credsRepo.load();

        const admin = new User({
            id: ADMIN_ID,
            firstname: 'Admin',
            email: ADMIN_EMAIL,
            permissions: {
                canSee: {
                    analytics: true,
                    pages: true,
                    products: true,
                    users: true,
                    orders: true,
                },
                canEdit: {
                    analytics: true,
                    pages: true,
                    products: true,
                    users: true,
                    orders: true,
                },
                canDelete: {
                    analytics: true,
                    pages: true,
                    products: true,
                    users: true,
                    orders: true,
                },
            }
        });

        usersRepo.data.unshift(admin);

        await credsRepo.addAsync(admin, ADMIN_PASSWORD);

        await usersRepo.save();
        await credsRepo.save();
    }
}

module.exports = UserRegistrationService;