const jwt = require('jsonwebtoken');
const ApiErrorFactory = require('../utils/ApiErrorFactory');
const { TokenManager } = require('./TokenManager');

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
        this.tokenManager = new TokenManager();

        SessionManager.instance = this;
    }

    createSession(userId) {
        const accessToken = this.tokenManager.generateAccessToken({userId});
        const refreshToken = this.tokenManager.generateRefreshToken({userId});
        
        const sessionData = {
            accessToken,
            refreshToken,
        };

        this.storage.set(userId, sessionData);

        return sessionData;
    }

    getSession(userId) {
        const session = this.storage.get(userId);
        if (!session) return null;

        if (this.isSessionExpired(session)) {
            this.endSession(userId);
            throw ApiErrorFactory.sessionExpired();
        }

        return session;
    }

    isSessionExpired(session) {
        const decodedAccessToken = this.tokenManager.verifyAccessToken(session.accessToken);
        const decodedRefreshToken = this.tokenManager.verifyRefreshToken(session.refreshToken);

        return (
            this.tokenManager.isTokenExpired(decodedAccessToken) 
            || this.tokenManager.isTokenExpired(decodedRefreshToken)
        );
    }

    endSession(userId) {
        this.storage.delete(userId);
    }
}

module.exports = SessionManager;