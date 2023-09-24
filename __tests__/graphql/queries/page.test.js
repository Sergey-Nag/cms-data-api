const mockAdmins = require('../../__mocks__/admins.json');
const mockPages = require('../../__mocks__/pages.json');
const {readData} = require('../../../data/index.js');
const server = require('../../../index');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');
const { mockSessionForUser } = require('../../utils');
const { PAGES_REPO_NAME, ADMINS_REPO_NAME } = require('../../../constants/repositoryNames');
const SessionManager = require('../../../managers/SessionManager');
const mockAdminsRepoName = ADMINS_REPO_NAME;
const mockPagesRepoName = PAGES_REPO_NAME;

jest.mock('../../../data/index.js', () => ({
    readData: jest.fn().mockImplementation((name) => {
        if (name === mockAdminsRepoName) {
            return Promise.resolve(mockAdmins);
        } else if (name === mockPagesRepoName) {
            return Promise.resolve(mockPages);
        }
    }),
    writeData: jest.fn((data) => data),
}));

describe('page query', () => {
    let userWithAccessToken, userWithoutAccessToken;
    const session = new SessionManager();

    beforeAll(() => {
        const first = session.createSession(mockAdmins[0].id);
        const second = session.createSession(mockAdmins[1].id);
        userWithAccessToken = first.accessToken;
        userWithoutAccessToken = second.accessToken;
    });

    afterAll(() => {
        session.endSession(mockAdmins[0].id);
        session.endSession(mockAdmins[1].id);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Should get specific page by id with all params (except created and modified by users) without Auth header', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `{
                    page(find: { id: "${mockPages[0].id}" }) {
                        id
                        createdISO
                        path
                        alias
                        title
                        lastModifiedISO
                        createdBy {
                            id
                            firstname
                        }
                        modifiedBy {
                            id
                            firstname
                        }
                        content
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.page).toBeDefined();
        const {id, contentId, createdById, modifiedById, ...rest} = mockPages[0];

        const expectedData = {
            ...rest,
            id,
            createdBy: {
                id: mockAdmins[0].id,
                firstname: mockAdmins[0].firstname,
            },
            modifiedBy: null,
            content: null,
        }
        expect(response.body.data.page).toEqual(expectedData);
    });

    it('Should get specific page by id when action user has access and can see created and modified by users', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `
                {
                    page(find: { id: "${mockPages[1].id}" }) {
                        id
                        createdBy {
                            id
                            firstname
                        }
                        modifiedBy {
                            id
                            firstname
                        }
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        
        const createdBy = mockAdmins.find(({id}) => id === mockPages[1].createdById );
        const modifiedBy = mockAdmins.find(({id}) => id === mockPages[1].modifiedById );
        expect(response.body.data.page).toEqual({
            id: mockPages[1].id,
            createdBy: {
                id: createdBy.id,
                firstname: createdBy.firstname,
            },
            modifiedBy: {
                id: modifiedBy.id,
                firstname: modifiedBy.firstname
            }
        });
    });

    it('Should get Action forbidden error when action user has no access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithoutAccessToken}`)
            .send({
                query: `
                {
                    page(find: { id: "${mockPages[1].id}" }) {
                        id
                    }
                }
                `
            });

        expect(response.body.data.page).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);
    });

    it('Should get a null when page is not found and corresponding error message', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `
                {
                    page(find: { id: "test-id-that-shouldnt-exist" }) {
                        id
                    }
                }
                `
            });

        expect(response.body.data.page).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.pageNotFound().message)
    });

    it.each([
        ['a page by id', `id: "${mockPages[1].id}"`, mockPages[1]],
        ['a page by alias', `alias: "${mockPages[2].alias}"`, mockPages[2]],
        [
            'a page by createdById and title', 
            `createdById: "${mockPages[3].createdById}" title: "${mockPages[3].title}"`, 
            mockPages[3]
        ],
        [
            'a page by modifiedById', 
            `modifiedById: "${mockAdmins[2].id}"`, 
            mockPages[2]
        ],
        [
            'a page by partial path',
            `path: ["new", "path"]`,
            mockPages[1]
        ],
        [
            'a page by full path',
            `path: ["new", "path", "with", "new", "page"]`,
            mockPages[4]
        ],
    ])('Filter should get %s', async (_, query, expectedPage) => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `
                {
                    page(
                        find: { ${query} }
                    ) {
                        id
                        title
                        alias
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.page).toBeDefined();

        const { id, title, alias } = expectedPage;
        expect(response.body.data.page).toEqual({ id, title, alias });
    });
});
