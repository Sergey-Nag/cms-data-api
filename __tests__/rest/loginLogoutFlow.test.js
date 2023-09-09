const server = require('../../index.js');
const supertest = require('supertest');
const data = require('../../data/index.js');
const mockUsers = require('../__mocks__/users.json');
const mockCredentials = require('../__mocks__/user-credentials.json');
const { REST_ENDPOINT } = require('../constants.js');
const ApiErrorFactory = require('../../utils/ApiErrorFactory.js');
const ApiSuccessFactory = require('../../utils/ApiSuccessFactory.js');

jest.mock('../../data/index.js', () => ({
    readData: jest.fn().mockImplementation((dataName) => {
        if (dataName === 'users') {
            return mockUsers;
        }

        return mockCredentials;
    }),
    writeData: jest.fn((data) => data),
}));


describe('REST /login and /logout flow', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should login and logout successfully', async () => {
        const userCredentials = {
            email: mockUsers[0].email,
            password: mockCredentials[0].__TEST__password
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
            email: mockUsers[0].email,
            password: mockCredentials[0].__TEST__password
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
