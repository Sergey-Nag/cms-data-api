const mockUsers = require('../../__mocks__/users.json');
const mockPages = require('../../__mocks__/pages.json');
const data = require('../../../data/index.js');
const server = require('../../../index');
const uniqid = require('uniqid');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');
const { expectPageData } = require('../utils');
const { merge } = require('lodash');
const SessionManager = require('../../../managers/SessionManager');
jest.mock('../../../managers/SessionManager');
const { mockSessionForUser } = require('../../utils');

const ACCESS_TOKEN = 'delete-page-access-token';

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

describe('deleteUser mutation', () => {
    const mockWriteDataFn = jest.fn();
    const MOCK_UNIQID = 'Pageuniqid';
    uniqid.mockReturnValue(MOCK_UNIQID);
    jest.spyOn(data, 'writeData').mockImplementation(mockWriteDataFn);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Should delete page by user that has access and return it', async () => {
        const deletePage = {...mockPages.at(-1)};
        mockSessionForUser(mockUsers[0].id, ACCESS_TOKEN);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `mutation {
                    deletePage(
                        id: "${deletePage.id}"
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
        expect(response.body.data.deletePage).toBeDefined();

        expectPageData(response.body.data.deletePage, deletePage);
        expect(mockPages).not.toContainEqual(deletePage);
        expect(mockWriteDataFn).toHaveBeenCalledWith('pages', mockPages);
    });

    it('Should get Action forbidden error when action user has no access', async () => {
        const notDeletedPage = {...mockPages.at(-1)};
        
        mockSessionForUser(mockUsers[1].id, ACCESS_TOKEN);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `mutation {
                    deletePage(
                        id: "${notDeletedPage.id}"
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.data.deletePage).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);
        
        expect(mockPages).toContainEqual(notDeletedPage);
        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });

    it('Should get Page not found error with wrong id', async () => {
        mockSessionForUser(mockUsers[0].id, ACCESS_TOKEN);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `mutation {
                    deletePage(
                        id: "not-existed-page-id"
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.data.deletePage).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.pageNotFound('not-existed-page-id').message);
        
        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });
});
