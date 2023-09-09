const mockUsers = require('./__mocks__/users.json');
const mockPages = require('./__mocks__/pages.json');
const mockCredentials = require('./__mocks__/user-credentials.json');

const SessionManager = require('../managers/SessionManager');
const {TokenManager} = require('../managers/TokenManager');
const ApiErrorFactory = require('../utils/ApiErrorFactory');

const mockSessionForUser = (userId, accessToken = 'test-token') => {
    jest.spyOn(TokenManager.prototype, 'verifyAccessToken').mockImplementation((token) => {
        if (token === accessToken) {
            return { userId };
        }
        throw ApiErrorFactory.tokenExpired();
    });
    jest.spyOn(SessionManager.prototype, 'getSession').mockImplementation((id) => id === userId ? { accessToken, refreshToken: '' } : null);
    jest.spyOn(SessionManager.prototype, 'isSessionExpired').mockImplementation((session) => session.accessToken === accessToken);
}

const mockReadData = (name) => {
    if (name === 'users') {
        return Promise.resolve(mockUsers);
    } else if (name === 'pages') {
        return Promise.resolve(mockPages);
    } else if (name === 'user-credentials') {
        return Promise.resolve(mockCredentials);
    }
};

module.exports = {
    mockSessionForUser,
    mockReadData
}