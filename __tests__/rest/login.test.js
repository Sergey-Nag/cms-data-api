const server = require('../../index.js');
const supertest = require('supertest');
const data = require('../../data/index.js');
const mockUsers = require('../__mocks__/users.json');
const mockCredentials = require('../__mocks__/user-credentials.json');
const { REST_ENDPOINT } = require('../constants.js');
const ApiErrorFactory = require('../../utils/ApiErrorFactory.js');
const SessionManager = require('../../managers/SessionManager.js');

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

const loginEndpoint = `${REST_ENDPOINT}/login`;

describe('REST /login', () => {
    const mockFn = jest.fn(() => {
        return { accessToken: 'access', refreshToken: 'refresh' };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should login user with proper credentials, start session and return tokens', async () => {
        jest.spyOn(SessionManager.prototype, 'createSession').mockImplementation(mockFn);
        const userCredentials = {
            email: mockUsers[0].email,
            password: mockCredentials[0].__TEST__password
        }

        const response = await supertest(server).post(loginEndpoint)
            .send(userCredentials)
            .expect(200);

        expect(response.body.error).toBeUndefined();
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
        expect(mockFn).toHaveBeenCalledWith(mockUsers[0].id);
    });

    it.each([
        [
            'Invalid email with empty email', { email: '', password: 'asd' }, ApiErrorFactory.userEmailInvalid(),
        ],
        [
            'Invalid email with email "wrong"', { email: 'wrong', password: 'asd' }, ApiErrorFactory.userEmailInvalid(),
        ],
        [
            'Invalid email with email "wrong@emaa@"', { email: 'wrong@emaa@', password: '' }, ApiErrorFactory.userEmailInvalid(),
        ],
        [
            'Invalid password with empty password', { email: 'ok@email.com', password: '' }, ApiErrorFactory.userPasswordInvalid(),
        ],
        [
            'Invalid password with password "1"', { email: 'ok@email.com', password: '1' }, ApiErrorFactory.userPasswordInvalid(),
        ],
        [
            'Invalid password with numbers in password',
            { email: 'ok@email.com', password: 123 },
            ApiErrorFactory.userPasswordInvalid(),
        ],
        [
            'Invalid credentials if user doen\'t exist',
            { email: 'not-existed@email.com', password: 'testpass' },
            ApiErrorFactory.userCredentialsInvalid(),
        ],
        [
            'Invalid credentials if user exists but password is wrong',
            { email: mockUsers[1].email, password: 'wrong-passwOrd' },
            ApiErrorFactory.userCredentialsInvalid(),
        ],
        [
            'Invalid credentials if user exists but password from another user',
            { email: mockUsers[1].email, password: mockCredentials[0].__TEST__password },
            ApiErrorFactory.userCredentialsInvalid(),
        ],
    ])('Should get error: %s ', async (_name, data, error) => {
        jest.spyOn(SessionManager.prototype, 'createSession').mockImplementation(mockFn);

        const response = await supertest(server).post(loginEndpoint)
            .send(data)
            .expect(401);

        expect(response.body.accessToken).toBeUndefined();
        expect(response.body.refreshToken).toBeUndefined();
        expect(response.body.error).toBe(error.message);
        expect(mockFn).not.toHaveBeenCalled();
    });
});
