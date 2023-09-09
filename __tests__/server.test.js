const server = require('../index.js');
const supertest = require('supertest');
const mockUsers = require('./__mocks__/users.json');
const mockPages = require('./__mocks__/pages.json');
const data = require('../data/index.js');
const { GRAPH_ENDPOINT } = require('./constants.js');
const SessionManager = require('../managers/SessionManager.js');
const { mockSessionForUser, mockReadData } = require('./utils.js');
jest.mock('../managers/SessionManager');
const ACCESS_TOKEN = 'access-token';

jest.mock('../data/index.js', () => ({
    readData: jest.fn().mockImplementation((name) => {
        if (name === 'users') {
            return Promise.resolve(mockUsers);
        } else if (name === 'pages') {
            return Promise.resolve(mockPages);
        }
    }),
    writeData: jest.fn((data) => data),
}));

describe('Server', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it(`Should use the GraphQl API middleware on ${GRAPH_ENDPOINT} endpoint`, async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `
                    {
                        users {
                            id
                            firstname
                        }
                    }
                `
            }).expect(200);

        expect(response.body?.data?.users).toBeDefined();
    });

    it.each([
        'pages',
        'users',
    ])('Should read %p json data when requests API', async (name) => {
        mockSessionForUser(mockUsers[0].id, ACCESS_TOKEN);

        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `
                    {
                        ${name} {
                            id
                        }
                    }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data[name]).toBeDefined();

        expect(data.readData).toHaveBeenCalledWith(name);
    });
});
