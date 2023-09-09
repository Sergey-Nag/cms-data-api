const jwt = require('jsonwebtoken');
const ApiErrorFactory = require('../utils/ApiErrorFactory');

const SECRET_ACCESS_TOKEN = process.env.SECRET_ACCESS_TOKEN ?? 'secret-access-token';
const SECRET_REFRESH_TOKEN = process.env.SECRET_REFRESH_TOKEN ?? 'secret-refresh-token';

const SECRET_ACCESS_TIME = process.env.SECRET_ACCESS_TIME ?? '1h';
const SECRET_REFRESH_TIME = process.env.SECRET_REFRESH_TIME ?? '2h';

class TokenManager {
    constructor() { }

    generateAccessToken(data) {
        return this.#generateToken(data, SECRET_ACCESS_TOKEN, SECRET_ACCESS_TIME);
    }
    generateRefreshToken(data) {
        return this.#generateToken(data, SECRET_REFRESH_TOKEN, SECRET_REFRESH_TIME);
    }

    verifyAccessToken(token) {
        return this.#verifyToken(token, SECRET_ACCESS_TOKEN);
    }

    verifyRefreshToken(token) {
        return this.#verifyToken(token, SECRET_REFRESH_TOKEN);
    }

    isTokenExpired(decoded) {
        const expTimeStamp = new Date(decoded.ext * 1000);
        const now = new Date();

        return now > expTimeStamp;
    }

    #generateToken(data, secret, time) {
        return jwt.sign(data, secret, { expiresIn: time });
    }

    #verifyToken(token, secret) {
        try {
            const decoded = jwt.verify(token, secret);

            return decoded;
        } catch (e) {
            throw ApiErrorFactory.tokenInvalid(e?.message);
        }
    }
}

module.exports = {
    TokenManager,
    SECRET_ACCESS_TOKEN,
    SECRET_REFRESH_TOKEN,
    SECRET_ACCESS_TIME,
    SECRET_REFRESH_TIME,
}