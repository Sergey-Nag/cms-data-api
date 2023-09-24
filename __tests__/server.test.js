const server = require('../index.js');
const supertest = require('supertest');
const mockAdmins = require('./__mocks__/admins.json');
const mockPages = require('./__mocks__/pages.json');
const data = require('../data/index.js');
const { GRAPH_ENDPOINT } = require('./constants.js');
const { mockSessionForUser, mockReadData } = require('./utils.js');
const { PAGES_REPO_NAME, ADMINS_REPO_NAME } = require('../constants/repositoryNames.js');
const SessionManager = require('../managers/SessionManager.js');
const ACCESS_TOKEN = 'access-token';
const mockAdminsRepoName = ADMINS_REPO_NAME;
const mockPagesRepoName = PAGES_REPO_NAME

jest.mock('../data/index.js', () => ({
    readData: jest.fn().mockImplementation((name) => {
        if (name === mockAdminsRepoName) {
            return Promise.resolve(mockAdmins);
        } else if (name === mockPagesRepoName) {
            return Promise.resolve(mockPages);
        }
    }),
    writeData: jest.fn((data) => data),
}));

describe('Server', () => {
    let userWithAccessToken;
    const session = new SessionManager();

    beforeAll(() => {
        const first = session.createSession(mockAdmins[0].id);
        userWithAccessToken = first.accessToken;
    });

    afterAll(() => {
        session.endSession(mockAdmins[0].id);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
    it(`Should use the GraphQl API middleware on ${GRAPH_ENDPOINT} endpoint`, async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `
                    {
                        pages {
                            items {
                                id
                                title
                            }
                        }
                    }
                `
            }).expect(200);

        expect(response.body.data.pages.items).toBeDefined();
    });

    it.each([
        PAGES_REPO_NAME,
        ADMINS_REPO_NAME,
    ])('Should read %p json data when requests API', async (name) => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `
                    {
                        ${name} {
                            items {
                                id
                            }
                        }
                    }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data[name].items).toBeDefined();

        expect(data.readData).toHaveBeenCalledWith(name);
    });
});
