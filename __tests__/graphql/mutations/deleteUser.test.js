const mockUsers = require('../../__mocks__/users.json');
const mockPages = require('../../__mocks__/pages.json');
const mockCredentials = require('../../__mocks__/user-credentials.json');
const data = require('../../../data/index.js');
const server = require('../../../index');
const uniqid = require('uniqid');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');
const { expectUserData } = require('../utils');
const { mockSessionForUser } = require('../../utils');
const SessionManager = require('../../../managers/SessionManager');
jest.mock('../../../managers/SessionManager');

const ACCESS_TOKEN = 'test-access-token';

jest.mock('uniqid');
jest.mock('../../../data/index.js', () => ({
    readData: jest.fn().mockImplementation((name) => {
        if (name === 'users') {
            return Promise.resolve(mockUsers);
        } else if (name === 'pages') {
            return Promise.resolve(mockPages);
        } else if (name === 'user-credentials') {
            return Promise.resolve(mockCredentials);
        }
    }),
    writeData: jest.fn(),
}));

describe('deleteUser mutation', () => {
    const mockWriteDataFn = jest.fn((name, data) => {
        if (name === 'user-credentials') {
            console.log('{creds}', data);
        }
    });
    const MOCK_UNIQID = 'Pageuniqid';
    uniqid.mockReturnValue(MOCK_UNIQID);
    jest.spyOn(data, 'writeData').mockImplementation(mockWriteDataFn);

    beforeEach(() => {
        jest.clearAllMocks();
    });


    it('Should get auth token not provided error if requests without Auth header', async () => {
        const deleteUser = {...mockUsers.at(-1)};
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `mutation {
                    deleteUser(
                        id: "${deleteUser.id}"
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.errors[0].message).toBe(ApiErrorFactory.authorizationTokenWasntProvided().message);
        expect(response.body.data.deleteUser).toBeNull();
    });

    it('Should delete user and credentials by user that has access and return it', async () => {
        mockSessionForUser(mockUsers[0].id, ACCESS_TOKEN);
        const deleteUser = {...mockUsers.at(-1)};
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `mutation {
                    deleteUser(
                        id: "${deleteUser.id}"
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
        expect(mockWriteDataFn).toHaveBeenCalledWith('user-credentials', expect.arrayContaining([
            expect.not.objectContaining({ id: deleteUser.id })
        ]));
    });
    
    it('Should get Action forbidden error when action user has no access', async () => {
        mockSessionForUser(mockUsers[1].id, ACCESS_TOKEN);
        const notDeletedUser = {...mockUsers.at(-1)};
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `mutation {
                    deleteUser(
                        id: "${notDeletedUser.id}"
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
        mockSessionForUser(mockUsers[0].id, ACCESS_TOKEN);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `mutation {
                    deleteUser(
                        id: "not-existed-user-id"
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
        mockSessionForUser('not-existed-user-id', ACCESS_TOKEN);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `mutation {
                    deleteUser(
                        id: "${mockUsers[2].id}"
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
