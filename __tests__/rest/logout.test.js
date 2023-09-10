const server = require('../../index.js');
const supertest = require('supertest');
const data = require('../../data/index.js');
const mockUsers = require('../__mocks__/users.json');
const mockCredentials = require('../__mocks__/user-credentials.json');
const { REST_ENDPOINT } = require('../constants.js');
const ApiErrorFactory = require('../../utils/ApiErrorFactory.js');
const SessionManager = require('../../managers/SessionManager.js');
const ApiSuccessFactory = require('../../utils/ApiSuccessFactory.js');
const { USERS_REPO_NAME } = require('../../constants/repositoryNames.js');
const mockUsersRepoName = USERS_REPO_NAME;

jest.mock('../../data/index.js', () => ({
    readData: jest.fn().mockImplementation((dataName) => {
        if (dataName === mockUsersRepoName) {
            return mockUsers;
        }

        return mockCredentials;
    }),
    writeData: jest.fn((data) => data),
}));


const apiEndpoint = `${REST_ENDPOINT}/logout`;

describe('REST /logout', () => {
    const mockFn = jest.fn();
    let session;
    beforeEach(() => {
        const sessions = new SessionManager();
        session = sessions.createSession(mockUsers[0].id);
    });
    afterEach(() => {
        const sessions = new SessionManager();
        sessions.endSession(mockUsers[0].id);
    
        jest.clearAllMocks();
    });

    it('Should get Unauthorized error if call without Authorization header', async () => {
        const response = await supertest(server).post(apiEndpoint)
            .expect(401);

        expect(response.body.error).toBe(ApiErrorFactory.authorizationTokenWasntProvided().message);
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
        const response = await supertest(server).post(apiEndpoint)
            .set('Authorization', token)
            .expect(401);

        expect(response.body.error).toBe(error.message);
        expect(mockFn).not.toHaveBeenCalled();
    });

    it('Should successfully logout authenticated user', async () => {
        const userId = mockUsers[0].id;
        const accessToken = session.accessToken;

        const response = await supertest(server).post(apiEndpoint)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
            
        expect(response.body.error).toBeUndefined();
        expect(response.body.message).toBe(ApiSuccessFactory.loggerOut());
    });
});
