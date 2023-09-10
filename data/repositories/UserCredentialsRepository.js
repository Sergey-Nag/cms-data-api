const { USER_CREDS_REPO_NAME } = require("../../constants/repositoryNames");
const Credentials = require("../models/users/Credentials");
const Repository = require("./Repository");

const isDev = process.env.NODE_ENV !== 'production';

class UserCredentialsRepository extends Repository {
    constructor() {
        super(USER_CREDS_REPO_NAME);
    }

    async addAsync({id, firstname }, password) {
        const credentials = new Credentials({id, password});
        await credentials.hashPassword(firstname?.length);
        return super.add(credentials);
    }

    async editAsync(id, newPassword) {
        const userCreds = this.get({id});
        if (!userCreds) return null;

        await userCreds.changePassword(newPassword);

        return userCreds;
    }

    async load() {
        await super.load();
        this.data = this.data.map((data) => new Credentials(data));
    }
}

module.exports = UserCredentialsRepository;