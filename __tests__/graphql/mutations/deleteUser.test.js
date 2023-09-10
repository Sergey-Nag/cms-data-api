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
const SessionManager = require('../../../managers/SessionManager');
const { USERS_REPO_NAME, USER_CREDS_REPO_NAME, PAGES_REPO_NAME } = require('../../../constants/repositoryNames');
const mockUsersRepoName = USERS_REPO_NAME;
const mockPagesRepoName = PAGES_REPO_NAME;
const mockCredsRepoName = USER_CREDS_REPO_NAME;

jest.mock('uniqid');
jest.mock('../../../data/index.js', () => ({
    readData: jest.fn().mockImplementation((name) => {
        if (name === mockUsersRepoName) {
            return Promise.resolve(mockUsers);
        } else if (name === mockPagesRepoName) {
            return Promise.resolve(mockPages);
        } else if (name === mockCredsRepoName) {
            return Promise.resolve(mockCredentials);
        }
    }),
    writeData: jest.fn(),
}));

describe('deleteUser mutation', () => {
    const mockWriteDataFn = jest.fn();
    const MOCK_UNIQID = 'Pageuniqid';
    uniqid.mockReturnValue(MOCK_UNIQID);
    jest.spyOn(data, 'writeData').mockImplementation(mockWriteDataFn);

    let userWithAccessToken, userWithoutAccessToken;
    const session = new SessionManager();

    beforeAll(() => {
        const first = session.createSession(mockUsers[0].id);
        const second = session.createSession(mockUsers[1].id);
        userWithAccessToken = first.accessToken;
        userWithoutAccessToken = second.accessToken;
    });

    afterAll(() => {
        session.endSession(mockUsers[0].id);
        session.endSession(mockUsers[1].id);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });


    it('Should get unauthorized error if requests without Auth header', async () => {
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

        expect(response.body.errors[0].message).toBe(ApiErrorFactory.unauthorized().message);
        expect(response.body.data.deleteUser).toBeNull();
    });

    it('Should delete user and credentials by user that has access and return it', async () => {
        const deleteUser = {...mockUsers.at(-1)};
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
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
        expect(mockWriteDataFn).toHaveBeenCalledWith(USERS_REPO_NAME, mockUsers);
        expect(mockWriteDataFn).toHaveBeenCalledWith(USER_CREDS_REPO_NAME, expect.arrayContaining([
            expect.not.objectContaining({ id: deleteUser.id })
        ]));
    });
    
    it('Should get Action forbidden error when action user has no access', async () => {
        const notDeletedUser = {...mockUsers.at(-1)};
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithoutAccessToken}`)
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
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
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

    it('Should get unauthorized error with not existed token', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer some-not-existed-token`)
            .send({
                query: `mutation {
                    deleteUser(
                        id: "${mockUsers[2].id}"
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.unauthorized().message);
        expect(response.body.data?.deleteUser).toBeUndefined();
        
        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });
});
