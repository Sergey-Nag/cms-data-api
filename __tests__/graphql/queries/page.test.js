const mockUsers = require('../../__mocks__/users.json');
const mockPages = require('../../__mocks__/pages.json');
const {readData} = require('../../../data/index.js');
const server = require('../../../index');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');
const SessionManager = require('../../../managers/SessionManager');
const { mockSessionForUser } = require('../../utils');
jest.mock('../../../managers/SessionManager');

const ACCESS_TOKEN = 'page-access-token';

jest.mock('../../../data/index.js', () => ({
    readData: jest.fn().mockImplementation((name) => {
        if (name === 'users') {
            return Promise.resolve(mockUsers);
        } else if (name === 'pages') {
            return Promise.resolve(mockPages);
        }
    }),
    writeData: jest.fn((data) => data),
}));

describe('page query', () => {
    beforeAll(() => {
        jest.clearAllMocks();
    });

    it('Should get specific page by id with all params (except created and modified by users) without Auth header', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `{
                    page(id: "${mockPages[0].id}") {
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
            createdBy: null,
            modifiedBy: null,
            content: null,
        }
        expect(response.body.data.page).toEqual(expectedData);
    });

    it('Should get specific page by id when action user has access and can see created and modified by users', async () => {
        mockSessionForUser(mockUsers[0].id, ACCESS_TOKEN);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `
                {
                    page(id: "${mockPages[1].id}") {
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
        
        const createdBy = mockUsers.find(({id}) => id === mockPages[1].createdById );
        const modifiedBy = mockUsers.find(({id}) => id === mockPages[1].modifiedById );
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
        mockSessionForUser(mockUsers[1].id, ACCESS_TOKEN);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `
                {
                    page(id: "${mockPages[1].id}") {
                        id
                    }
                }
                `
            });

        expect(response.body.data.page).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);
    });

    it('Should get a null when pages is not found and corresponding error message', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `
                {
                    page(id: "test-id-that-shouldnt-exist") {
                        id
                    }
                }
                `
            });

        expect(response.body.data.page).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.pageNotFound('test-id-that-shouldnt-exist').message)
    });

    it.each([
        ['a page by id', `id: "${mockPages[1].id}"`, mockPages[1]],
        ['a page by alias', `alias: "another"`, mockPages[2]],
        [
            'a page by createdById and title', 
            `createdById: "test-1" title: "4"`, 
            mockPages[3]
        ],
        [
            'a page by modifiedById', 
            `createdById: "test-2"`, 
            mockPages[1]
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
                        ${query}
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
