const server = require('../../index.js');
const supertest = require('supertest');
const data = require('../../data/index.js');
const mockUsers = require('../__mocks__/users.json');
const mockCredentials = require('../__mocks__/user-credentials.json');
const { REST_ENDPOINT } = require('../constants.js');
const ApiErrorFactory = require('../../utils/ApiErrorFactory.js');
const SessionManager = require('../../managers/SessionManager.js');
const ApiSuccessFactory = require('../../utils/ApiSuccessFactory.js');
const { TokenManager } = require('../../managers/TokenManager.js');

jest.mock('../../data/index.js', () => ({
    readData: jest.fn().mockImplementation((dataName) => {
        if (dataName === 'users') {
            return mockUsers;
        }

        return mockCredentials;
    }),
    writeData: jest.fn((data) => data),
}));

jest.mock('../../managers/SessionManager.js');
jest.mock('../../managers/TokenManager.js');

const apiEndpoint = `${REST_ENDPOINT}/logout`;

describe('REST /logout', () => {
    const mockFn = jest.fn();

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should get Unauthorized error if call without Authorization header', async () => {
        jest.spyOn(SessionManager.prototype, 'endSession').mockImplementation(mockFn);

        const response = await supertest(server).post(apiEndpoint)
            .expect(401);

        expect(response.body.error).toBe(ApiErrorFactory.authorizationTokenWasntProvided().message);
        expect(mockFn).not.toHaveBeenCalledWith(mockUsers[0].id);
    });

    it.each([
        [
            'No auth token without Bearer', `br`, ApiErrorFactory.authorizationTokenWasntProvided(),
        ],
        [
            'No auth token with empty Bearer', `Bearer `, ApiErrorFactory.authorizationTokenWasntProvided(),
        ],
        [
            'Unauthorized with wrong Bearer', `Bearer 123`, ApiErrorFactory.unauthorized(),
        ],
    ])('Should get error: %s ', async (_name, token, error) => {
        jest.spyOn(SessionManager.prototype, 'endSession').mockImplementation(mockFn);

        const response = await supertest(server).post(apiEndpoint)
            .set('Authorization', token)
            .expect(401);

        expect(response.body.error).toBe(error.message);
        expect(mockFn).not.toHaveBeenCalled();
    });

    it('Should successfully logout authenticated user', async () => {
        const userId = mockUsers[0].id;
        const accessToken = 'access-user-token';

        const mockVerifyToken = jest.fn((token) => {
            if (token === accessToken) {
                return { userId };
            }
            throw ApiErrorFactory.tokenExpired();
        });
        const mockGetSession = jest.fn((id) => id === userId);

        jest.spyOn(TokenManager.prototype, 'verifyAccessToken').mockImplementation(mockVerifyToken);
        jest.spyOn(SessionManager.prototype, 'getSession').mockImplementation(mockGetSession);

        const response = await supertest(server).post(apiEndpoint)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
            
        expect(mockVerifyToken).toHaveBeenCalledWith(accessToken);
        expect(mockGetSession).toHaveBeenCalledWith(userId);
        expect(response.body.error).toBeUndefined();
        expect(response.body.message).toBe(ApiSuccessFactory.loggerOut());
    });
});
