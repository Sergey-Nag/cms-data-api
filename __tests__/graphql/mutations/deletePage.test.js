const mockAdmins = require('../../__mocks__/admins.json');
const mockPages = require('../../__mocks__/pages.json');
const data = require('../../../data/index.js');
const server = require('../../../index');
const uniqid = require('uniqid');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');
const { expectPageData } = require('../utils');
const SessionManager = require('../../../managers/SessionManager');
const { PAGES_REPO_NAME, ADMINS_REPO_NAME } = require('../../../constants/repositoryNames');
const mockAdminsRepoName = ADMINS_REPO_NAME;
const mockPagesRepoName = PAGES_REPO_NAME;

jest.mock('uniqid');
jest.mock('../../../data/index.js', () => ({
    readData: jest.fn().mockImplementation((name) => {
        if (name === mockAdminsRepoName) {
            return Promise.resolve(mockAdmins);
        } else if (name === mockPagesRepoName) {
            return Promise.resolve(mockPages);
        }
    }),
    writeData: jest.fn(),
}));

describe('Delete entity mutation (deletePage)', () => {
    const mockWriteDataFn = jest.fn();
    const MOCK_UNIQID = 'Pageuniqid';
    uniqid.mockReturnValue(MOCK_UNIQID);
    jest.spyOn(data, 'writeData').mockImplementation(mockWriteDataFn);

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

    it('Should delete page by user that has access and return it', async () => {
        const deletePage = {...mockPages.at(-1)};
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `mutation {
                    deletePages(
                        ids: ["${deletePage.id}"]
                    ) {
                        id
                        path
                        alias
                        title
                        createdISO
                        lastModifiedISO
                        createdBy {
                            id
                        }
                        modifiedBy {
                            id
                        }
                    }
                }`
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.deletePages).toBeDefined();

        expectPageData(response.body.data.deletePages[0], deletePage);
        expect(mockPages).not.toContainEqual(deletePage);
        expect(mockWriteDataFn).toHaveBeenCalledWith(PAGES_REPO_NAME, mockPages);
    });

    it('Should get Action forbidden error when action user has no access', async () => {
        const notDeletedPage = {...mockPages.at(-1)};
        
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithoutAccessToken}`)
            .send({
                query: `mutation {
                    deletePages(
                        ids: ["${notDeletedPage.id}"]
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.data.deletePages).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);
        
        expect(mockPages).toContainEqual(notDeletedPage);
        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });

    it('Should get Page not found error with wrong id', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `mutation {
                    deletePages(
                        ids: ["not-existed-page-id"]
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.data.deletePages).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.pageNotFound().message);
        
        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });

    it('Should delete multiple pages by user that has access and return them', async () => {
        const deletePages = [mockPages[0], mockPages[1]];
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `mutation {
                    deletePages(
                        ids: ["${deletePages[0].id}", "${deletePages[1].id}"]
                    ) {
                        id
                        path
                        alias
                        title
                        createdISO
                        lastModifiedISO
                        createdBy {
                            id
                        }
                        modifiedBy {
                            id
                        }
                    }
                }`
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.deletePages).toBeDefined();

        response.body.data.deletePages.forEach((deletedPage, index) => {
            expectPageData(deletedPage, deletePages[index]);
        });
        expect(mockPages).not.toContainEqual(deletePages[0]);
        expect(mockPages).not.toContainEqual(deletePages[1]);
        expect(mockWriteDataFn).toHaveBeenCalledWith(PAGES_REPO_NAME, mockPages);
    });
});
