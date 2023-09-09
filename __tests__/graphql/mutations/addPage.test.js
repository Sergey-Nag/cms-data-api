const mockUsers = require('../../__mocks__/users.json');
const mockPages = require('../../__mocks__/pages.json');
const data = require('../../../data/index.js');
const server = require('../../../index');
const uniqid = require('uniqid');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');
const SessionManager = require('../../../managers/SessionManager');
const {TokenManager} = require('../../../managers/TokenManager');
jest.mock('../../../managers/SessionManager');
jest.mock('../../../managers/TokenManager');
const { mockSessionForUser } = require('../../utils');

const ACCESS_TOKEN = 'access-token';

jest.mock('uniqid');
jest.mock('../../../data/index.js', () => ({
    readData: jest.fn().mockImplementation((name) => {
        if (name === 'users') {
            return Promise.resolve(mockUsers);
        } else if (name === 'pages') {
            return Promise.resolve(mockPages);
        }
    }),
    writeData: jest.fn(),
}));

const MOCK_ISO_TIME = '2023-09-02T19:30:36.258Z'
Date.prototype.toISOString = jest.fn(() => MOCK_ISO_TIME);

describe('addPage mutation', () => {
    const mockWriteDataFn = jest.fn();
    const MOCK_UNIQID = 'Pageuniqid';
    uniqid.mockReturnValue(MOCK_UNIQID);
    jest.spyOn(data, 'writeData').mockImplementation(mockWriteDataFn);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Should get unauthorized error if requests without Auth header', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `mutation {
                    addPage(
                        alias: "new"
                        title:"New Page"
                        path: ["new", "page","path"]
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.errors[0].message).toBe(ApiErrorFactory.unauthorized().message);
        expect(response.body.data.addPage).toBeNull();
    });

    it('Should save data with proper values by user that has access and return it', async () => {
        mockSessionForUser(mockUsers[0].id, ACCESS_TOKEN);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `mutation {
                    addPage(
                        alias: "new"
                        title:"New Page"
                        path: ["new", "page","path"]
                    ) {
                        id
                        path
                        alias
                        title
                        createdISO
                        lastModifiedISO
                        createdBy {
                            id
                            firstname
                        }
                        modifiedBy {
                            id
                        }
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.addPage).toBeDefined();
        const {addPage} = response.body.data;
        const expectedData = {
            alias: 'new',
            modifiedById: null,
            id: MOCK_UNIQID,
            path: ["new", "page","path"],
            title: 'New Page',
            createdISO: MOCK_ISO_TIME,
            lastModifiedISO: null,
            createdById: mockUsers[0].id,
            contentId: null
        }

        expect(addPage).toHaveProperty('id', expectedData.id);
        expect(addPage).toHaveProperty('path', expectedData.path);
        expect(addPage).toHaveProperty('alias', expectedData.alias);
        expect(addPage).toHaveProperty('title', expectedData.title);
        expect(addPage).toHaveProperty('createdISO', expectedData.createdISO);
        expect(addPage).toHaveProperty('lastModifiedISO', expectedData.lastModifiedISO);
        expect(addPage).toHaveProperty('createdBy', {
            id: mockUsers[0].id,
            firstname: mockUsers[0].firstname,
        });
        expect(addPage).toHaveProperty('modifiedBy', null);

        expect(mockPages).toContainEqual(expectedData);
        expect(mockWriteDataFn).toHaveBeenCalledWith('pages', mockPages);
    });

    it('Should create alias automatically when it is not provided', async () => {
        mockSessionForUser(mockUsers[0].id, ACCESS_TOKEN);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `mutation {
                    addPage(
                        title:"New Page"
                        path: ["new", "page","path"]
                    ) {
                        alias
                    }
                }
                `
            });
        
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.addPage).toBeDefined();

        expect(response.body.data.addPage).toHaveProperty('alias', 'new-page');
    });

    it('Should get Action forbidden error when action user has no access', async () => {
        mockSessionForUser(mockUsers[1].id, ACCESS_TOKEN);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `mutation {
                    addPage(
                        alias: "new-2"
                        title:"New Page #2"
                        path: ["new", "page","path", "two"]
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
            path: ["new", "page","path", "two"],
            title: 'New Page #2',
            createdISO: MOCK_ISO_TIME,
            lastModifiedISO: null,
            createdById: mockUsers[0].id,
            contentId: null
        });
        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });

    it('Should get alias invalid error', async () => {
        const INVALID_ALIAS = "SOME ALIAs for a page  ";
        mockSessionForUser(mockUsers[0].id, ACCESS_TOKEN);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `mutation {
                    addPage(
                        alias: "${INVALID_ALIAS}"
                        title:"New Page #2"
                        path: ["new", "page","path", "two"]
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
        mockSessionForUser(mockUsers[0].id, ACCESS_TOKEN);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `mutation {
                    addPage(
                        title:"New Page #2"
                        path: ${invalidPath}
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
        mockSessionForUser(mockUsers[0].id, ACCESS_TOKEN);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `mutation {
                    addPage(
                        title: "${title}"
                        path: ["new"]
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