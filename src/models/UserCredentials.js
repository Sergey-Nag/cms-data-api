module.exports = class UserCredentials {
    constructor(userId, hashedPassword) {
        this.userId = userId;
        this.hashedPassword = hashedPassword;
    }

    static create(userId, hashedPassword) {
        return new UserCredentials(userId, hashedPassword);
    }
}
