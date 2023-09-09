const Credentials = require("../models/users/Credentials");
const Repository = require("./Repository");

const isDev = process.env.NODE_ENV !== 'production';

class UserCredentialsRepository extends Repository {
    constructor() {
        super('user-credentials');
    }

    // get(queryData) {
    //     const cred = super.get(queryData);
    //     if (!cred) return false;

    //     return new Credentials(cred.id, cred.hashedPassword);
    // }

    async addAsync({id, firstname }, password) {
        const credentials = new Credentials({id, password});
        await credentials.hashPassword(firstname?.length ?? Math.round(Math.random() * 100));
        return super.add(credentials);
    }

    edit(id, hashedPassword) {
        const userCreds = this.get({id});
        if (!userCreds) return false;

        const updatedCreds = new Credentials({id, hashedPassword});
        return super.edit(id, updatedCreds);
    }

    async load() {
        await super.load();
        this.data = this.data.map((data) => new Credentials(data));
    }
}

module.exports = UserCredentialsRepository;