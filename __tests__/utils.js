const mockAdmins = require('./__mocks__/admins.json');
const mockPages = require('./__mocks__/pages.json');

const SessionManager = require('../managers/SessionManager');
const {TokenManager} = require('../managers/TokenManager');
const ApiErrorFactory = require('../utils/ApiErrorFactory');
const { USERS_REPO_NAME } = require('../constants/repositoryNames');

const mockSessionForUser = (userId, accessToken = 'test-token') => {
    const sessionManager = new SessionManager();
    const tokens = sessionManager.createSession(userId);
    return{ 
        ...tokens, 
        endSession: () => {
            sessionManager.endSession(userId);
        } 
    };
    // jest.spyOn(TokenManager.prototype, 'verifyAccessToken').mockImplementation((token) => {
    //     if (token === accessToken) {
    //         return { userId };
    //     }
    //     throw ApiErrorFactory.tokenExpired();
    // });
    // jest.spyOn(SessionManager.prototype, 'getSession').mockImplementation((id) => id === userId ? { accessToken, refreshToken: '' } : null);
    // jest.spyOn(SessionManager.prototype, 'isSessionExpired').mockImplementation((session) => session.accessToken === accessToken);
}

const mockReadData = (name) => {
    if (name === USERS_REPO_NAME) {
        return Promise.resolve(mockAdmins);
    } else if (name === 'pages') {
        return Promise.resolve(mockPages);
    }
};

module.exports = {
    mockSessionForUser,
    mockReadData
}