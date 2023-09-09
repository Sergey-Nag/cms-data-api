const mockUsers = require('./__mocks__/users.json');
const mockPages = require('./__mocks__/pages.json');
const mockCredentials = require('./__mocks__/user-credentials.json');

const SessionManager = require('../managers/SessionManager');
const ApiErrorFactory = require('../utils/ApiErrorFactory');

const mockSessionForUser = (userId, accessToken = 'test-token') => {
    jest.spyOn(SessionManager.prototype, 'verifyAccessToken').mockImplementation((token) => {
        userId === 'test-id' && console.log('{token}',token, accessToken);
        if (token === accessToken) {
            return { userId };
        }
        throw ApiErrorFactory.tokenExpired();
    });
    jest.spyOn(SessionManager.prototype, 'getSession').mockImplementation((id) => id === userId && { accessToken, refreshToken: '' });
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