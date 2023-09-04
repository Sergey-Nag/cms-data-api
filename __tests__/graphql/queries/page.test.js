const mockUsers = require('../../__mocks__/users.json');
const mockPages = require('../../__mocks__/pages.json');
const {readData} = require('../../../data/index.js');
const server = require('../../../index');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');

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

    it('Should get specific page by id with all params', async () => {
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
        const {id, createdById, modifiedById, contentId, ...rest} = mockPages[0];
        const createdBy = createdById && mockUsers.find(({id}) => id === createdById );
        const modifiedBy = modifiedById && mockUsers.find(({id}) => id === modifiedById );

        const expectedData = {
            ...rest,
            id,
            createdBy: createdBy && {
                id: createdBy.id,
                firstname: createdBy.firstname,
            },
            modifiedBy: modifiedBy && {
                id: modifiedBy.id,
                firstname: modifiedBy.firstname,
            },
            content: null,
        }
        expect(response.body.data.page).toEqual(expectedData);
    });

    it('Should get specific page by id when action user has access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `
                {
                    page(id: "${mockPages[1].id}" actionUserId: "${mockUsers[0].id}") {
                        id
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.page).toEqual({
            id: mockPages[1].id
        });
    });

    it('Should get Action forbidden error when action user has no access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `
                {
                    page(id: "${mockPages[1].id}" actionUserId: "${mockUsers[1].id}") {
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
