const User = require("../models/User");
const RepositoryService = require("../services/RepositoryService");

module.exports = class UsersRepository extends RepositoryService {
    constructor() {
        super('users');
    }

    add(data) {
        const newUser = User.create(data);
        console.log(newUser);
        return super.add(newUser);
    }
}