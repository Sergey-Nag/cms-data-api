const mockUsers = require('../../__mocks__/users.json');
const mockPages = require('../../__mocks__/pages.json');
const data = require('../../../data/index.js');
const server = require('../../../index');
const uniqid = require('uniqid');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');
const { expectUserData } = require('../utils');
const { merge } = require('lodash');

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

    it('Should delete user by user that has access and return it', async () => {
        const deleteUser = {...mockUsers.at(-1)};
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `mutation {
                    deleteUser(
                        id: "${deleteUser.id}"
                        actionUserId: "${mockUsers[0].id}"
                    ) {
                        id
                        firstname
                        lastname
                        email
                        isOnline
                        createdISO
                        lastModifiedISO
                        permissions {
                            canSee {
                                analytics
                                products
                                orders
                                pages
                                users
                            }
                            canEdit {
                                analytics
                                products
                                orders
                                pages
                                users
                            }
                            canDelete {
                                analytics
                                products
                                orders
                                pages
                                users
                            }
                        }
                        createdBy {
                            id
                        }
                    }
                }`
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.deleteUser).toBeDefined();

        expectUserData(response.body.data.deleteUser, deleteUser);
        expect(mockUsers).not.toContainEqual(deleteUser);
        expect(mockWriteDataFn).toHaveBeenCalledWith('users', mockUsers);
    });
    
    it('Should get Action forbidden error when action user has no access', async () => {
        const notDeletedUser = {...mockUsers.at(-1)};
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `mutation {
                    deleteUser(
                        id: "${notDeletedUser.id}"
                        actionUserId: "${mockUsers[1].id}"
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.data.deleteUser).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);
        
        expect(mockUsers).toContainEqual(notDeletedUser);
        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });

    it('Should get User not found error with wrong id', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `mutation {
                    deleteUser(
                        id: "not-existed-user-id"
                        actionUserId: "${mockUsers[0].id}"
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.data.deleteUser).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.userNotFound().message);
        
        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });

    it('Should get User not found error with wrong actionUserId', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `mutation {
                    deleteUser(
                        id: "${mockUsers[2].id}"
                        actionUserId: "not-existed-user-id"
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.data.deleteUser).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.userNotFound().message);
        
        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });
});
