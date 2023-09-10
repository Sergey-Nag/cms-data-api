const bcrypt = require('bcryptjs');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = class Credentials {
    constructor({id, password, hashedPassword, __TEST__password = null}) {
        this.id = id;
        this.hashedPassword = password ?? hashedPassword;
        this.rounds = Math.round(Math.random() * 10);

        if (isDev || __TEST__password) {
            this.__TEST__password = __TEST__password ?? password;
        }
    }

    async hashPassword(rounds) {
        if (rounds) this.rounds = Math.min(rounds, 20);
        this.hashedPassword = await bcrypt.hash(this.hashedPassword, this.rounds);
    }

    async changePassword(newPassword) {
        this.hashedPassword = newPassword;
        if (isDev) {
            this.__TEST__password = newPassword;
        }
        await this.hashPassword();
    }

    async isPasswordValidAsync(password) {
        return await bcrypt.compare(password, this.hashedPassword);
    }
}