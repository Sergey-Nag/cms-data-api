const bcrypt = require('bcrypt');

module.exports = class Credentials {
    constructor(userId, password) {
        this.id = userId;
        this.hashedPassword = password;
    }

    async hashPassword(rounds) {
        this.hashedPassword = await bcrypt.hash(this.hashedPassword, rounds);
    }

    async isPasswordValidAsync(password) {
        return await bcrypt.compare(password, this.hashedPassword);
    }
}