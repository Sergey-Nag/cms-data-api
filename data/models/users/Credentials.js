const bcrypt = require('bcrypt');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = class Credentials {
    constructor({id, password, hashedPassword, __TEST__password = null}) {
        this.id = id;
        this.hashedPassword = password ?? hashedPassword;

        if (__TEST__password) {
            this.__TEST__password = __TEST__password ?? password;
        }
    }

    async hashPassword(rounds) {
        this.hashedPassword = await bcrypt.hash(this.hashedPassword, rounds);
    }

    async isPasswordValidAsync(password) {
        return await bcrypt.compare(password, this.hashedPassword);
    }
}