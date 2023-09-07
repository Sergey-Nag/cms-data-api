const jwt = require('jsonwebtoken');
const ApiErrorFactory = require('../utils/ApiErrorFactory');

const SECRET_ACCESS_TOKEN = process.env.SECRET_ACCESS_TOKEN ?? 'secret-access-token';
const SECRET_REFRESH_TOKEN = process.env.SECRET_REFRESH_TOKEN ?? 'secret-refresh-token';

const SECRET_ACCESS_TIME = process.env.SECRET_ACCESS_TIME ?? '1h';
const SECRET_REFRESH_TIME = process.env.SECRET_REFRESH_TIME ?? '2h';

class SessionManager {
    static instance = null;
    static getInstance() {
        return SessionManager.instance ?? new SessionManager();
    }

    constructor() {
        if (SessionManager.instance) {
            return SessionManager.instance;
        }

        this.storage = new Map();

        SessionManager.instance = this;
    }

    createSession(userId) {
        // Generate a JWT containing user information.
        const accessToken = this.#generateToken(userId, SECRET_ACCESS_TOKEN, SECRET_ACCESS_TIME);
        const refreshToken = this.#generateToken(userId, SECRET_REFRESH_TOKEN, SECRET_REFRESH_TIME);
        
        // Store the token in the session data.
        const sessionData = {
            accessToken,
            refreshToken,
        };

        this.storage.set(userId, sessionData);

        return sessionData;
    }

    verifyAccessToken(token) {
        return this.#verifyToken(token, SECRET_ACCESS_TOKEN);
    }

    verifyRefreshToken(token) {
        return this.#verifyToken(token, SECRET_REFRESH_TOKEN);
    }

    getSession(userId) {
        return this.storage.get(userId);
    }

    endSession(userId) {
        // Delete the session data when the user logs out or the session expires.
        this.storage.delete(userId);
    }

    #generateToken(userId, secret, time) {
        return jwt.sign({ userId }, secret, { expiresIn: time });
    }

    #verifyToken(token, secret) {
        try {
            const decoded = jwt.verify(token, secret);
            
            return decoded;
        } catch(e) {
            throw ApiErrorFactory.tokenInvalid(e?.message);
        }
    }

    isTokenExpired(decoded) {
        const expTimeStamp = new Date(decoded.ext * 1000);
        const now = new Date();

        return now > expTimeStamp;
    }
}

module.exports = SessionManager;