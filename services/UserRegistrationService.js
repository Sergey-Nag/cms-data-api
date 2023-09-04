const { UserRepository } = require("../data/repositories");

class UserRegistrationService {
    constructor() {
        this.userRepository = new UserRepository();
    }
}