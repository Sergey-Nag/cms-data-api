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

describe('pages query', () => {
    beforeAll(() => {
        jest.clearAllMocks();
    });

    it('Should get list of pages with all params', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `{
                    pages {
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
        expect(response.body.data.pages).toBeDefined();
        expect(response.body.data.pages.length).toBe(5);
        const expectedData = mockPages.map(({id, createdById, modifiedById, contentId, ...rest}) => {
            const createdBy = createdById && mockUsers.find(({id}) => id === createdById );
            const modifiedBy = modifiedById && mockUsers.find(({id}) => id === modifiedById );

            return {
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
                content: null
            }
        })
        expect(response.body.data.pages).toEqual(expectedData);
    });

    it('Should get list of pages when action user has access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `
                {
                    pages(actionUserId: "${mockUsers[0].id}") {
                        id
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.pages.length).toBe(5);
        expect(response.body.data.pages).toEqual(mockPages.map(({ id })=> ({ id })));
    });

    it('Should get Action forbidden error when action user has no access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `
                {
                    pages(actionUserId: "${mockUsers[1].id}") {
                        id
                    }
                }
                `
            });

        expect(response.body.data.pages).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);
    });

    it('Should get an empty array when pages are not found', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `
                {
                    pages(id: "test-id-that-shouldnt-exist") {
                        id
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.pages).toBeDefined();
        expect(response.body.data.pages.length).toBe(0);
    });

    it.each([
        ['1 page by id', `id: "${mockPages[1].id}"`, [mockPages[1]]],
        ['2 pages by alias', `alias: "another"`, [mockPages[2], mockPages[4]]],
        [
            '1 page by createdById and title', 
            `createdById: "test-1" title: "4"`, 
            [mockPages[3]]
        ],
        [
            '1 page by modifiedById', 
            `createdById: "test-2"`, 
            [mockPages[1]]
        ],
        [
            '3 pages that start with same path',
            `path: ["new", "path"]`,
            [mockPages[1], mockPages[3], mockPages[4]]
        ],
        [
            '1 page by full path',
            `path: ["new", "path", "with", "new", "page"]`,
            [mockPages[4]]
        ],
    ])('Filter should get %s', async (_, query, expectedPages) => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `
                {
                    pages(
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
        expect(response.body.data.pages).toBeDefined();
        expect(response.body.data.pages.length).toBe(expectedPages.length);

        const expectedData = expectedPages.map(({id, title, alias}) => ({ id, title, alias }));
        expect(response.body.data.pages).toEqual(expectedData);
    });
});
