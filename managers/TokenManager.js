const jwt = require('jsonwebtoken');
const ApiErrorFactory = require('../utils/ApiErrorFactory');
const { 
    SECRET_ACCESS_TOKEN,
    SECRET_ACCESS_TIME,
    SECRET_REFRESH_TOKEN,
    SECRET_REFRESH_TIME
} = require('../constants/env');

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
            throw ApiErrorFactory.unauthorized();
        }
    }

    decodeToken(token) {
        try {
            const decoded = jwt.decode(token)
            return decoded;
        } catch(e) {
            console.log(e);
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