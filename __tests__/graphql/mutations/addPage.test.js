const mockAdmins = require('../../__mocks__/admins.json');
const mockPages = require('../../__mocks__/pages.json');
const data = require('../../../data/index.js');
const server = require('../../../index');
const uniqid = require('uniqid');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');
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

const MOCK_ISO_TIME = '2023-09-02T19:30:36.258Z'
Date.prototype.toISOString = jest.fn(() => MOCK_ISO_TIME);

describe('Add entity mutation (addPage)', () => {
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

    it('Should get unauthorized error if requests without Auth header', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `mutation {
                    addPage(
                        input: {
                            alias: "new"
                            title:"New Page"
                            path: ["new", "page","path"]
                        }
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.errors[0].message).toBe(ApiErrorFactory.unauthorized().message);
        expect(response.body.data.addPage).toBeNull();
    });

    it('Should get Action forbidden error when action user has no access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithoutAccessToken}`)
            .send({
                query: `mutation {
                    addPage(
                        input: {
                            alias: "new-2"
                            title:"New Page #2"
                            path: ["new", "page","path", "two"]
                        }
                    ) {
                        id
                        alias
                        title
                        path
                    }
                }
                `
            });

        expect(response.body.data.addPage).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);

        expect(mockPages).not.toContainEqual({
            alias: 'new-2',
            modifiedById: null,
            id: MOCK_UNIQID,
            path: ["new", "page", "path", "two"],
            title: 'New Page #2',
            createdISO: MOCK_ISO_TIME,
            lastModifiedISO: null,
            createdById: mockAdmins[0].id,
            contentId: null
        });
        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });

    it('Should save data with proper values by user that has access and return it', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `mutation {
                    addPage(
                        input: {
                            alias: "new"
                            title:"New Page"
                            path: ["new", "page","path"]
                        }
                    ) {
                        id
                        path
                        alias
                        title
                        isPublished
                        createdISO
                        lastModifiedISO
                        createdBy {
                            id
                            firstname
                        }
                        modifiedBy {
                            id
                        }
                        meta {
                            keywords
                            description
                            author
                            canonical
                            card {
                                title
                                description
                                url
                                imageUrl
                            }
                        }
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.addPage).toBeDefined();
        const { addPage } = response.body.data;
        const expectedData = {
            alias: 'new',
            modifiedById: null,
            id: MOCK_UNIQID,
            path: ["new", "page", "path"],
            title: 'New Page',
            createdISO: MOCK_ISO_TIME,
            lastModifiedISO: null,
            createdById: mockAdmins[0].id,
            contentId: null,
            isPublished: false,
            meta: {
                keywords: null,
                description: null,
                author: null,
                canonical: null,
                card: {
                    title: null,
                    description: null,
                    imageUrl: null,
                    url: null
                }
            }
        }

        expect(addPage).toHaveProperty('id', expectedData.id);
        expect(addPage).toHaveProperty('path', expectedData.path);
        expect(addPage).toHaveProperty('alias', expectedData.alias);
        expect(addPage).toHaveProperty('title', expectedData.title);
        expect(addPage).toHaveProperty('createdISO', expectedData.createdISO);
        expect(addPage).toHaveProperty('lastModifiedISO', expectedData.lastModifiedISO);
        expect(addPage).toHaveProperty('createdBy', {
            id: mockAdmins[0].id,
            firstname: mockAdmins[0].firstname,
        });
        expect(addPage).toHaveProperty('modifiedBy', null);

        expect(mockPages).toContainEqual(expect.objectContaining(expectedData));
        expect(mockWriteDataFn).toHaveBeenCalledWith('pages', mockPages);
    });

    it('Should create a page with metadata and isPublished is true', async () => {
        const keywords = 'test keywords';
        const description = 'test description';
        const author = 'test author';
        const canonical = 'canonical url http://something.com';
        const cardTitle = 'test social card title';
        const cardDescr = 'test social card description';
        const cardImage = 'test social card image url http://something.com/some-image.jpg';
        const cardUrl = 'test social card url http://something.com';

        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `mutation {
                    addPage(
                        input: {
                            title:"New Page with metadata"
                            path: ["new", "page", "meta"]
                            isPublished: true
                            meta: {
                                keywords: "${keywords}"
                                description: "${description}"
                                author: "${author}"
                                canonical: "${canonical}"
                                card: {
                                    title: "${cardTitle}"
                                    description: "${cardDescr}"
                                    url: "${cardUrl}"
                                    imageUrl: "${cardImage}"
                                }
                            }
                        }
                    ) {
                        isPublished
                        meta {
                            keywords
                            description
                            author
                            canonical
                            card {
                                title
                                description
                                url
                                imageUrl
                            }
                        }
                    }
                }
                `
            });
            expect(response.body.errors).toBeUndefined();
            expect(response.body.data.addPage).toBeDefined();
            expect(response.body.data.addPage).toEqual({
                isPublished: true,
                meta: {
                    keywords,
                    description,
                    author,
                    canonical,
                    card: {
                        title: cardTitle,
                        description: cardDescr,
                        imageUrl: cardImage,
                        url: cardUrl
                    }
                }
            })
    });

    it('Should get page with same title already exist error', async () => {
        expect(mockPages).toHaveLength(7);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `mutation {
                    addPage(
                        input: {
                            title: "${mockPages[0].title}"
                            path: ["new", "page","path"]
                        }
                    ) {
                        alias
                    }
                }
                `
            });

        expect(response.body.data.addPage).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.pageAlreadyExists('title').message);
        expect(mockPages).toHaveLength(7);
    });

    it('Should get page with same alias already exist error', async () => {
        expect(mockPages).toHaveLength(7);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `mutation {
                    addPage(
                        input: {
                            title: "Some other page title"
                            path: ["index", "page"]
                            alias: "${mockPages[1].alias}"
                        }
                    ) {
                        alias
                    }
                }
                `
            });

        expect(response.body.data.addPage).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.pageAlreadyExists('alias').message);
        expect(mockPages).toHaveLength(7);
    });

    it('Should create alias automatically when it is not provided', async () => {
        expect(mockPages).toHaveLength(7);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `mutation {
                    addPage(
                        input: {
                            title:"New Page 2"
                            path: ["new", "page","path"]
                        }
                    ) {
                        alias
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.addPage).toBeDefined();

        expect(response.body.data.addPage).toHaveProperty('alias', 'new-page-2');
        expect(mockPages).toHaveLength(8);
    });



    it('Should get alias invalid error', async () => {
        const INVALID_ALIAS = "SOME ALIAs for a page  ";
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `mutation {
                    addPage(
                        input: {
                            alias: "${INVALID_ALIAS}"
                            title:"New Page #2"
                            path: ["new", "page","path", "two"]
                        }
                    ) {
                        id
                        alias
                    }
                }
                `
            });

        expect(response.body.data.addPage).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.pageAliasInvalid(INVALID_ALIAS.trim()).message);
    });


    it.each([
        ['empty path', '[]', ApiErrorFactory.pagePathIsEmpty()],
        ['not cebab case', '[""]', ApiErrorFactory.pagePathIsEmpty()],
        ['not cebab case', '["new", "page for", "you"]', ApiErrorFactory.pagePathIsNotValid()],
    ])('Should get %s error when path is %s', async (_, invalidPath, error) => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `mutation {
                    addPage(
                        input: {
                            title:"New Page #2"
                            path: ${invalidPath}
                        }
                    ) {
                        id
                        alias
                    }
                }
                `
            });

        expect(response.body.data.addPage).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(error.message);
    });

    it.each([
        [''],
        ['a'],
        ['   '],
        ['   b'],
        ['    c  '],
    ])('Should get the short title error when title is "%s"', async (title) => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `mutation {
                    addPage(
                        input: {
                            title: "${title}"
                            path: ["new"]
                        }
                    ) {
                        id
                        alias
                    }
                }
                `
            });

        expect(response.body.data.addPage).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.pageTitleToShort().message);
    });
});