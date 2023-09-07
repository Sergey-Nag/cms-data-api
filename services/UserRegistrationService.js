const uniqid = require('uniqid');
const { UserCredentialsRepository } = require("../data/repositories");
const ApiErrorFactory = require("../utils/ApiErrorFactory");

class UserRegistrationService {
    static generatePassword() {
        return uniqid();
    }
    static async createPasswordForUser(user) {
        const credsRepo = new UserCredentialsRepository();
        await credsRepo.load();

        if (!user) {
            throw ApiErrorFactory.somethingWentWrong();
        }

        const password = this.generatePassword();
        const userCreds = await credsRepo.add(user, password);

        if (!userCreds || !(await userCreds.isPasswordValidAsync(password))) {
            throw ApiErrorFactory.somethingWentWrong();
        }

        await credsRepo.save();
        return password;
    }
}

module.exports = UserRegistrationService;