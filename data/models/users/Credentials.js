const bcrypt = require('bcrypt');
const { HASH_PASSWORD_ROUNDS } = require('../../../constants/env');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = class UserCredentials {
    constructor({hashedPassword, __TEST__password } = {}) {
        this.hashedPassword = hashedPassword;

        if (__TEST__password) {
            this.__TEST__password = __TEST__password;
        }
    }

    async hashPassword(password) {
        this.hashedPassword = await bcrypt.hash(password, HASH_PASSWORD_ROUNDS);

        if (isDev) {
            this.__TEST__password = password;
        }
    }

    async isPasswordValidAsync(password) {
        return await bcrypt.compare(password, this.hashedPassword);
    }
}