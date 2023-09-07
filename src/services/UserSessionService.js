const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET ?? 'some-access-secret';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET ?? 'some-refresh-secret';
const ACCESS_TIME = '1s';
const REFRESH_TIME = '1m';

module.exports = class UserSessionService {
    static #instance = null;
    static getInstance() {
        if (this.#instance) return this.#instance;

        return this.#instance = new UserSessionService();
    }

    constructor() {
        this.usersId = [];
    }

    login(id) {
        const accessToken = this.#generateToken(id, ACCESS_SECRET, ACCESS_TIME);
        const refreshToken = this.#generateToken(id, REFRESH_SECRET, REFRESH_TIME);
        this.users.push(id);
        return { accessToken, refreshToken };
    }

    refreshUserAccessToken(id) {
        return this.#generateToken(id, ACCESS_SECRET, ACCESS_TIME);
    }

    logout(user) {
        const index = this.users.findIndex((u) => u.id === user.id);

        if (index !== -1) {
            this.users.splice(index, 1);
        }
    }

    verifyUserByAccessToken(token) {
        return this.verifyUserByToken(token, ACCESS_SECRET);
    }
    
    verifyUserByRefreshToken(token) {
        return this.verifyUserByToken(token, REFRESH_SECRET);
    }

    verifyUserByToken(token, secrer) {
        try {
            const decoded = jwt.verify(token, secrer);
            return this.users.find((id) => id === decoded.id);
        } catch(e) {
            return null;
        }
    }

    isOnline(id) {
        return this.users.findIndex((u) => u.id === id) !== -1;
    }

    isTokenExpired(token) {
        try {
            // Verify and decode the token
            const decodedToken = jwt.verify(token, ACCESS_SECRET);

            // Check the expiration claim
            const currentTimestamp = Math.floor(Date.now() / 1000); // Convert to seconds
            return (decodedToken.exp && decodedToken.exp < currentTimestamp)
        } catch (error) {
            return true;
        }
    }


    #generateToken(id, secret, time) {
        const token = jwt.sign({ id }, secret, { expiresIn: time });
        return token;
    }
}