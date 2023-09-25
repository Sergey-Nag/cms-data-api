const Repository = require('../../data/repositories/Repository');
const { ADMINS_REPO_NAME } = require('../../constants/repositoryNames');
const Admin = require('../../data/models/users/Admin');
const DataResolver = require('../DataResolver');
const UserValidator = require('../../data/validators/UserValidator');
const UserRegistrationService = require('../../services/UserRegistrationService');

class AdminsResolver extends DataResolver {
    static instance = null;
    constructor() {
        if (AdminsResolver.instance) {
            return AdminsResolver.instance;
        }

        super(new Repository(ADMINS_REPO_NAME), Admin, UserValidator);

        AdminsResolver.instance = this;
    }

    async add(parent, args, context) {
        const admin = await super.add(parent, args, context);

        const password = UserRegistrationService.generatePassword();

        await admin.setPassword(password);
        await this.repository.save();
        return admin;
    }
}

module.exports = AdminsResolver;
