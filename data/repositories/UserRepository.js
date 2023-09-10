const IRepository = require('./Repository');
const User = require('../models/users/User');
const { USERS_REPO_NAME } = require('../../constants/repositoryNames');

class UserRepository extends IRepository {
    constructor() {
        super(USERS_REPO_NAME);
    }


    add(data, actionUserId) {
        const newUser = new User(data, actionUserId);

        return super.add(newUser);
    }

    edit(id, data) {
        const user = this.get({id});
        if (!user) return false;

        const updatedUser = new User(user);
        updatedUser.update(data);
        return super.edit(id, updatedUser);
    }
}

module.exports = UserRepository;
