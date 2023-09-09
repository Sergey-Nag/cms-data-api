const mockUsers = require('../../__mocks__/users.json');
const mockPages = require('../../__mocks__/pages.json');
const data = require('../../../data/index.js');
const server = require('../../../index');
const uniqid = require('uniqid');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');
const { mockSessionForUser } = require('../../utils');
const SessionManager = require('../../../managers/SessionManager');
const { expectPageData } = require('../utils');
jest.mock('../../../managers/SessionManager');

const ACCESS_TOKEN = 'edit-page-access-token';

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

describe('aditPage mutation', () => {
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
                    editPage(
                        id: "ololo"
                        data: {}
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.errors[0].message).toBe(ApiErrorFactory.unauthorized().message);
        expect(response.body.data.editPage).toBeNull();
    });

    it('Should update a page data by user that has access and return it', async () => {
        const enteredData = {
            id: mockPages[0].id,
            title: 'new title',
            alias: 'page-alias',
            modifiedById: mockUsers[0].id,
        }
        mockSessionForUser(mockUsers[0].id, ACCESS_TOKEN);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `mutation {
                    editPage(
                        id: "${enteredData.id}"
                        data: {
                            title: "${enteredData.title}"
                            path: ["new", "path"]
                            alias: "${enteredData.alias}"
                        }
                    ) {
                        id
                        title
                        path
                        alias
                        lastModifiedISO
                        modifiedBy {
                            id
                        }
                    }
                }`
            });


        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.editPage).toBeDefined();

        const expectedData = {
            ...mockPages[0],
            ...enteredData,
            path: ['new', 'path'],
            lastModifiedISO: MOCK_ISO_TIME,
        };

        const { editPage } = response.body.data;

        expect(editPage).toHaveProperty('id', expectedData.id);
        expect(editPage).toHaveProperty('title', expectedData.title);
        expect(editPage).toHaveProperty('alias', expectedData.alias);
        expect(editPage).toHaveProperty('path', expectedData.path);
        expect(editPage).toHaveProperty('lastModifiedISO', expectedData.lastModifiedISO);
        expect(editPage).toHaveProperty('modifiedBy', {
            id: expectedData.modifiedById,
        });

        expect(mockPages).toContainEqual(expectedData);
        expect(mockWriteDataFn).toHaveBeenCalledWith('pages', mockPages);
    });

    it.each([
        [
            ['title'], ['Some New title']
        ],
        [
            ['alias'], ['new-alias']
        ],
        [
            ['path'], [["new", "update", "path"]]
        ],
        [
            ['title', 'path'], ["Brand new title", ["brand", "new", "path"]]
        ],
        [
            ['title', 'alias'], ["Brand new title", "just-another-alias"]
        ],
        [
            ['path', 'alias'], [['new', 'path', 'ohoho'], "just-one-more-alias"]
        ],
    ])('Should update only provided properties: %s', async (props, values) => {
        const updateData = props.reduce((acc, prop, i) => {
            acc[prop] = values[i];
            return acc;
        }, {});
        const oldPage = {...mockPages[0]};

        mockSessionForUser(mockUsers[0].id, ACCESS_TOKEN);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                variables: {
                    updateData,
                },
                query: `mutation EDIT($updateData: EditPageInput!) {
                    editPage(
                        id: "${mockPages[0].id}"
                        data: $updateData
                    ) {
                        id
                        path
                        alias
                        title
                        createdISO
                        lastModifiedISO
                    }
                }`
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.editPage).toBeDefined();
        expect(response.body.data.editPage).toHaveProperty('lastModifiedISO', MOCK_ISO_TIME);
        expectPageData(response.body.data.editPage, updateData, oldPage);

        expect(mockWriteDataFn).toHaveBeenCalled();
    });

    it.each([
        [
            'Should get Action forbidden error when action user has no access',
            {
                id: mockPages[0].id,
                actionUserId: mockUsers[1].id
            },
            ApiErrorFactory.actionForbidden(),
        ],
        [
            'Should get Page not found error when id is wrong',
            {
                id: 'not-existed-page-id',
                actionUserId: mockUsers[0].id
            },
            ApiErrorFactory.pageNotFound('not-existed-page-id'),
        ],
        [
            'Should get Page not found error when id is empty',
            {
                id: '',
                actionUserId: mockUsers[0].id
            },
            ApiErrorFactory.pageNotFound(),
        ],
        [
            'Should get User not found error when id is wrong',
            {
                id: mockPages[0].id,
                actionUserId: 'not-existed-page-id'
            },
            ApiErrorFactory.unauthorized(),
        ],
    ])('%s', async (_, {id, actionUserId}, error) => {
        mockSessionForUser(actionUserId, ACCESS_TOKEN);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                variables: {
                    id
                },
                query: `mutation EDIT($id: String!) {
                    editPage(
                        id: $id
                        data: {
                            title: "new title"
                        }
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.data.editPage).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(error.message);

        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });

    it.each([
        [
            ['title'], [''], ApiErrorFactory.pageTitleToShort(),
        ],
        [
            ['title'], [' 1 '], ApiErrorFactory.pageTitleToShort(),
        ],
        [
            ['title'], [' s  '], ApiErrorFactory.pageTitleToShort(),
        ],
        [
            ['alias'], [''], ApiErrorFactory.pageAliasInvalid(),
        ],
        [
            ['alias'], ['hello world'], ApiErrorFactory.pageAliasInvalid('hello world'),
        ],
        [
            ['path'], [[]], ApiErrorFactory.pagePathIsEmpty(),
        ],
        [
            ['path'], [['']], ApiErrorFactory.pagePathIsEmpty(),
        ],
        [
            ['path'], [['  ']], ApiErrorFactory.pagePathIsEmpty(),
        ],
        [
            ['path'], [['  ', '  ']], ApiErrorFactory.pagePathIsEmpty(),
        ],
        [
            ['path'], [['hello world']], ApiErrorFactory.pagePathIsNotValid(),
        ],
        [
            ['title', 'path', 'alias'], ['w', ['hello world'], 'hello world'], ApiErrorFactory.pagePathIsNotValid(),
        ],
        [
            ['title', 'path', 'alias'], ['w', ['hello-world'], 'hello world'], ApiErrorFactory.pageTitleToShort(),
        ],
        [
            ['title', 'path', 'alias'], ['correct title', ['hello-world'], 'hello world'], ApiErrorFactory.pageAliasInvalid('hello world'),
        ],
    ])('Should get %s validation error when values: %s', async (props, values, error) => {
        const updateData = props.reduce((acc, prop, i) => {
            acc[prop] = values[i];
            return acc;
        }, {});

        mockSessionForUser(mockUsers[0].id, ACCESS_TOKEN);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                variables: {
                    updateData,
                },
                query: `mutation EDIT($updateData: EditPageInput!) {
                    editPage(
                        id: "${mockPages[0].id}"
                        data: $updateData
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.data.editPage).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(error.message);

        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });
});
