const server = require('../../index.js');
const supertest = require('supertest');
const mockUsers = require('../__mocks__/users.json');
const mockCredentials = require('../__mocks__/user-credentials.json');
const SessionManager = require("../../managers/SessionManager");
const data = require('../../data/index.js');
const { REST_ENDPOINT } = require('../constants');
const { USERS_REPO_NAME, USER_CREDS_REPO_NAME } = require('../../constants/repositoryNames');
const ApiErrorFactory = require('../../utils/ApiErrorFactory');
const jwt = require('jsonwebtoken')
const uniqid = require('uniqid');
const { SECRET_ACCESS_TOKEN } = require('../../constants/env');
const ApiSuccessFactory = require('../../utils/ApiSuccessFactory.js');
const mockUsersRepoName = USERS_REPO_NAME;
const mockCredsRepoName = USER_CREDS_REPO_NAME;

const apiEndpoint = `${REST_ENDPOINT}/change-password`;

jest.mock('../../data/index.js', () => ({
    readData: jest.fn().mockImplementation((dataName) => {
        if (dataName === mockUsersRepoName) {
            return mockUsers;
        } else if (dataName === mockCredsRepoName) {
            return mockCredentials;
        }
    }),
    writeData: jest.fn((data) => data),
}));

describe('Change password', () => {
    const nonexistendUserAccessToken = jwt.sign({ userId: 'not-existed-user-id' }, SECRET_ACCESS_TOKEN, { expiresIn: '1m' });

    let session;
    beforeEach(() => {
        const sessions = new SessionManager();
        session = sessions.createSession(mockUsers[0].id);
    });
    afterEach(() => {
        const sessions = new SessionManager();
        sessions.endSession(mockUsers[0].id);
    });

    it('Should get Token was not provided error when request without Auth header', async () => {
        const response = await supertest(server).post(apiEndpoint)
            .send({
                newPassword: 'asd'
            })
            .expect(401);

        expect(response.body.error).toBe(ApiErrorFactory.authorizationTokenWasntProvided().message);
    });

    it('Should get Content not provided error if no data in body', async () => {
        const response = await supertest(server).post(apiEndpoint)
            .set('Authorization', `Bearer ${session.accessToken}`)
            .send({})
            .expect(400);

        expect(response.body.error).toBe(ApiErrorFactory.dataNotProvided().message);
    });

    it.each([
        [ 'invalid', 'asdfasd' ],
        [ 'from nonexistent user', nonexistendUserAccessToken ],
        [ 'is refresh token', false ],
    ])('Should get Unauthorized error when acces token %s', async (_, token) => {
        const response = await supertest(server).post(apiEndpoint)
            .set('Authorization', `Bearer ${token ?? session.refreshToken}`)
            .send({
                newPassword: 'asd'
            })
            .expect(401);

        expect(response.body.error).toBe(ApiErrorFactory.unauthorized().message);
    });

    it.each([
        [ 'as dfas d' ],
        [ '1' ],
        [ ' a1s  ' ],
        [ 'acds321c^:' ],
        [ 'ac2dsc\'' ],
        [ '.cdsc323' ],
        [ '.cdsc3-)023' ],
        [ '<asd></asd>' ],
    ])('Should get password validation error when password is "%s"', async (password) => {
        const mockWriteData = jest.fn(() => Promise.resolve([]));
        jest.spyOn(data, 'writeData').mockImplementation(mockWriteData);
        const response = await supertest(server).post(apiEndpoint)
            .set('Authorization', `Bearer ${session.accessToken}`)
            .send({
                newPassword: password
            })
            .expect(400);

        expect(response.body.error).toBe(ApiErrorFactory.userPasswordInvalid().message);
        expect(mockWriteData).not.toHaveBeenCalled();
    });

    it('Should successfully update password', async () => {
        const newPassword = 'NewPassword';
        const mockWriteData = jest.fn(() => Promise.resolve());
        jest.spyOn(data, 'writeData').mockImplementation(mockWriteData);
        const response = await supertest(server).post(apiEndpoint)
            .set('Authorization', `Bearer ${session.accessToken}`)
            .send({
                newPassword,
            })
            .expect(200);

        expect(response.body.error).toBeUndefined();
        expect(response.body.message).toBe(ApiSuccessFactory.passwordUpdated());
        expect(mockWriteData).toHaveBeenCalledWith(USER_CREDS_REPO_NAME, expect.arrayContaining([
            expect.objectContaining({ id: mockUsers[0].id, __TEST__password: newPassword })
        ]));
    });

    it.each([
        [ 'somepassword' ],
        [ 'newPasw231d' ],
        [ 'olol-o09cc' ],
        [ 'ALLCAPITALS' ],
        [ uniqid() ],
        [ uniqid('-') ],
        [ uniqid() ],
        [ uniqid('1', '!') ],
        [ uniqid(undefined, '1-!') ],
    ])('Should successfully update different passwords: %p', async (newPassword) => {
        const mockWriteData = jest.fn(() => Promise.resolve());
        jest.spyOn(data, 'writeData').mockImplementation(mockWriteData);
        const prevHashedPassword = mockCredentials[0].hashedPassword;
        const response = await supertest(server).post(apiEndpoint)
            .set('Authorization', `Bearer ${session.accessToken}`)
            .send({
                newPassword,
            })
            .expect(200);

        expect(response.body.error).toBeUndefined();
        expect(response.body.message).toBe(ApiSuccessFactory.passwordUpdated());

        const { hashedPassword: updatedHashedPassword } = mockWriteData
            .mock.calls[0][1]
            .find((obj) => obj.id === mockUsers[0].id) ?? {};

        expect(updatedHashedPassword).toBeDefined();
        expect(updatedHashedPassword).not.toBe(prevHashedPassword);
    })
});