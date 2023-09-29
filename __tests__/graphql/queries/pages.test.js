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

describe('pages query', () => {
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

    beforeAll(() => {
        jest.clearAllMocks();
    });

    it('Should get list of pages with all params (except created and modified by users)', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `{
                    pages {
                        items {
                            id
                            createdISO
                            path
                            alias
                            title
                            lastModifiedISO
                            content
                            isPublished
                            meta {
                                author
                                canonical
                                description
                                keywords
                                card {
                                    description
                                    imageUrl
                                    title
                                    url
                                }
                            }
                        }
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.pages.items).toBeDefined();
        expect(response.body.data.pages.items.length).toBe(5);
        const expectedData = mockPages.map(({id, createdById, modifiedById, contentId, ...rest}) => {
            return {
                ...rest,
                id,
                content: null
            }
        })
        expect(response.body.data.pages.items).toEqual(expectedData);
    });

    it('Should get list of pages when action user has access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `
                {
                    pages {
                        items {
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
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.pages.items.length).toBe(5);
        const expectedMap = mockPages.map(({ id, createdById, modifiedById })=> {
            const createdBy = createdById && mockAdmins.find(({id}) => id === createdById );
            const modifiedBy = modifiedById && mockAdmins.find(({id}) => id === modifiedById );
            return {
                id,
                modifiedBy: modifiedBy ? {
                    id: modifiedBy.id,
                    firstname: modifiedBy.firstname,
                } : null,
                createdBy: createdBy ? {
                    id: createdBy.id,
                    firstname: createdBy.firstname,
                } : null
            } 
        });
        expect(response.body.data.pages.items).toEqual(expectedMap);
    });

    it('Should get Action forbidden error when action user has no access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithoutAccessToken}`)
            .send({
                query: `
                {
                    pages {
                        items {
                            id
                        }
                    }
                }
                `
            });

        expect(response.body.data.pages).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);
    });

    it('Should get an empty array when pages are not found', async () => {
        const filter = {
            id: 'test-id-that-shouldnt-exist'
        }
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                variables: {
                    filter,
                },
                query: `
                query Get($filter: PagesFilter){
                    pages(
                        filter: $filter
                    ) {
                        items {
                            id
                        }
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.pages.items).toBeDefined();
        expect(response.body.data.pages.items.length).toBe(0);
    });

    it.each([
        ['1 page by id', `id: "${mockPages[1].id}"`, [mockPages[1]]],
        ['2 pages by alias', `alias: "another"`, [mockPages[2], mockPages[4]]],
        [
            '1 page by createdById and title', 
            `createdById: "${mockAdmins[0].id}" title: "4"`, 
            [mockPages[3]]
        ],
        [
            '1 page by modifiedById', 
            `modifiedById: "${mockAdmins[1].id}"`, 
            [mockPages[1]]
        ],
        [
            '3 pages that has "index" and "page" in path',
            `path: ["index", "page"]`,
            [mockPages[0], mockPages[1], mockPages[4]]
        ],
        [
            '2 pages that have same keyword in meta',
            `meta: { keywords: "test" }`,
            [mockPages[0], mockPages[3]]
        ],
        [
            '1 page that has meta description and does not have description in card',
            `meta: { description: "description" card: { description: null } }`,
            [mockPages[2]]
        ],
    ])('Filter should get %s', async (_, query, expectedPages) => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `
                {
                    pages(
                        filter: {${query}}
                    ) {
                        items {
                            id
                            title
                            alias
                        }
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.pages.items).toBeDefined();
        expect(response.body.data.pages.items.length).toBe(expectedPages.length);

        const expectedData = expectedPages.map(({id, title, alias}) => ({ id, title, alias }));
        expect(response.body.data.pages.items).toEqual(expectedData);
    });

    it.each([
        [
            'sort by title ASC',
            {
                sort: [
                    {
                        field: 'title',
                        order: 'ASC'
                    }
                ]
            },
            [0, 3, 4, 1, 2],
            {
                end: null,
                itemsLeft: null
            }
        ],
        [
            'sort by createdISO DESC',
            {
                sort: [
                    {
                        field: 'createdISO',
                        order: 'DESC'
                    },
                ]
            },
            [3,4,2,1,0],
            {
                end: null,
                itemsLeft: null
            }
        ],
        [
            'sort by createdISO DESC and alias ASC',
            {
                sort: [
                    {
                        field: 'createdISO',
                        order: 'DESC'
                    },
                    {
                        field: 'alias',
                        order: 'ASC'
                    },
                ]
            },
            [4,3,2,1,0],
            {
                end: null,
                itemsLeft: null
            }
        ],
        [
            'filter by creadedById and sort by createdISO DESC',
            {
                filter: {
                    createdById: mockAdmins[0].id
                },
                sort: [
                    {
                        field: 'createdISO',
                        order: 'DESC'
                    },
                ]
            },
            [3, 4, 0],
            {
                end: null,
                itemsLeft: null
            }
        ],
        [
            'paginate without amount',
            {
                pagination: {
                    start: 0
                },
            },
            [0, 1, 2, 3, 4],
            {
                end: 5,
                itemsLeft: 0
            }
        ],
        [
            'get paginated second item, 3 items remain',
            {
                pagination: {
                    start: 1,
                    amount: 1
                },
            },
            [1],
            {
                end: 2,
                itemsLeft: 3
            }
        ],
        [
            'get paginated third item, 2 items remain',
            {
                pagination: {
                    start: 2,
                    amount: 1
                },
            },
            [2],
            {
                end: 3,
                itemsLeft: 2
            }
        ],
        [
            'get paginated fourth and fifth items, and no items left',
            {
                pagination: {
                    start: 3,
                    amount: 2
                },
            },
            [3, 4],
            {
                end: 5,
                itemsLeft: 0
            }
        ],
        [
            'get paginated no items, and no items left',
            {
                pagination: {
                    start: 5,
                    amount: 2
                },
            },
            [],
            {
                end: 5,
                itemsLeft: 0
            }
        ],
        [
            'get paginated no items when start index is negative number',
            {
                pagination: {
                    start: -2,
                    amount: 2
                },
            },
            [],
            {
                end: 0,
                itemsLeft: 5
            }
        ],
        [
            'get paginated no items when amount is negative number',
            {
                pagination: {
                    start: 1,
                    amount: -4
                },
            },
            [],
            {
                end: 0,
                itemsLeft: 5
            }
        ],
        [
            'filter by title, sort by lastModifiedISO DESC and paginate to get 2 items and 1 remain',
            {
                filter: {
                    title: 'new'
                },
                sort: [
                    {
                        field: 'lastModifiedISO',
                        order: 'DESC'
                    }
                ],
                pagination: {
                    start: 0,
                    amount: 2
                }
            },
            [3, 4],
            {
                end: 2,
                itemsLeft: 1
            }
        ],
        [
            'filter by title, sort by lastModifiedISO DESC and paginate to get last item and no remain',
            {
                filter: {
                    title: 'new'
                },
                sort: [
                    {
                        field: 'lastModifiedISO',
                        order: 'DESC'
                    }
                ],
                pagination: {
                    start: 2,
                    amount: 2
                }
            },
            [0],
            {
                end: 3,
                itemsLeft: 0
            }
        ],
    ])('Should %s', async (_, variables, pageIndexes, pagination) => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                variables,
                query: `query Get($sort: [Sort] $filter: PagesFilter $pagination: Pagination) {
                    pages(sort: $sort filter: $filter pagination: $pagination) {
                        items {
                            id
                            title
                            alias
                        }
                        end
                        itemsLeft
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.pages.items).toBeDefined();
        expect(response.body.data.pages.items).toEqual(
            pageIndexes.map((index) => {
                const { id, title, alias } = mockPages[index];
                return { id, title, alias };
            })
        );
        expect(response.body.data.pages).toHaveProperty('end', pagination.end);
        expect(response.body.data.pages).toHaveProperty('itemsLeft', pagination.itemsLeft);
    })
});
