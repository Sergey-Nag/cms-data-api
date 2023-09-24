const server = require('../../index.js');
const supertest = require('supertest');
const data = require('../../data/index.js');
const mockAdmins = require('../__mocks__/admins.json');
const { REST_ENDPOINT } = require('../constants.js');
const ApiErrorFactory = require('../../utils/ApiErrorFactory.js');
const ApiSuccessFactory = require('../../utils/ApiSuccessFactory.js');
const { ADMINS_REPO_NAME } = require('../../constants/repositoryNames.js');
const mockAdminsRepoName = ADMINS_REPO_NAME;

jest.mock('../../data/index.js', () => ({
    readData: jest.fn().mockImplementation((dataName) => {
        if (dataName === mockAdminsRepoName) {
            return mockAdmins;
        }
    }),
    writeData: jest.fn((data) => data),
}));


describe('REST /login and /logout flow', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should login and logout successfully', async () => {
        const userCredentials = {
            email: mockAdmins[0].email,
            password: mockAdmins[0]._secret.__TEST__password
        }

        const loginResponse = await supertest(server).post(`${REST_ENDPOINT}/login`)
            .send(userCredentials)
            .expect(200);

        expect(loginResponse.body.error).toBeUndefined();
        expect(loginResponse.body.accessToken).toBeDefined();
        expect(loginResponse.body.refreshToken).toBeDefined();
        
        const logoutResponse = await supertest(server).post(`${REST_ENDPOINT}/logout`)
            .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
            .expect(200)

        expect(logoutResponse.body.error).toBeUndefined();
        expect(logoutResponse.body.message).toBe(ApiSuccessFactory.loggerOut());
    });

    it('Should not logout with refreshToken', async () => {
        const userCredentials = {
            email: mockAdmins[0].email,
            password: mockAdmins[0]._secret.__TEST__password
        }

        const loginResponse = await supertest(server).post(`${REST_ENDPOINT}/login`)
            .send(userCredentials)
            .expect(200);

        expect(loginResponse.body.error).toBeUndefined();
        expect(loginResponse.body.accessToken).toBeDefined();
        expect(loginResponse.body.refreshToken).toBeDefined();

        const logoutResponse = await supertest(server).post(`${REST_ENDPOINT}/logout`)
            .set('Authorization', `Bearer ${loginResponse.body.refreshToken}`)
            .expect(401)

        expect(logoutResponse.body.error).toBe(ApiErrorFactory.unauthorized().message);
        expect(logoutResponse.body.message).toBeUndefined();
    });
});
