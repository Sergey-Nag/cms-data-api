const server = require('../index.js');
const supertest = require('supertest');
const mockUsers = require('./__mocks__/users.json');
const mockPages = require('./__mocks__/pages.json');
const data = require('../data/index.js');
const { GRAPH_ENDPOINT } = require('./constants.js');
const { mockSessionForUser, mockReadData } = require('./utils.js');
const { USERS_REPO_NAME, PAGES_REPO_NAME } = require('../constants/repositoryNames.js');
const ACCESS_TOKEN = 'access-token';
const mockUsersRepoName = USERS_REPO_NAME;
const mockPagesRepoName = PAGES_REPO_NAME

jest.mock('../data/index.js', () => ({
    readData: jest.fn().mockImplementation((name) => {
        if (name === mockUsersRepoName) {
            return Promise.resolve(mockUsers);
        } else if (name === mockPagesRepoName) {
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
        PAGES_REPO_NAME,
        USERS_REPO_NAME,
    ])('Should read %p json data when requests API', async (name) => {
        const {accessToken, endSession} = mockSessionForUser(mockUsers[0].id, ACCESS_TOKEN);

        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${accessToken}`)
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
        endSession();
    });
});
