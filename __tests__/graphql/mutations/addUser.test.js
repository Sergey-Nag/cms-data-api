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
const { USERS_REPO_NAME, PAGES_REPO_NAME, USER_CREDS_REPO_NAME } = require('../../../constants/repositoryNames');
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

const MOCK_ISO_TIME = '2023-09-02T19:30:36.258Z'
Date.prototype.toISOString = jest.fn(() => MOCK_ISO_TIME);


describe('addUser mutation', () => {
    const mockWriteDataFn = jest.fn();
    const MOCK_UNIQID = 'Useruniq';
    jest.spyOn(data, 'writeData').mockImplementation(mockWriteDataFn);
    uniqid.mockReturnValue(MOCK_UNIQID);
    
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
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `mutation {
                    addUser(
                        firstname: "test"
                        lastname: "test"
                        email: "test"
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.errors[0].message).toBe(ApiErrorFactory.unauthorized().message);
        expect(response.body.data.addUser).toBeNull();
    });

    it('Should save credentials and user with proper values (without permissions) by user that has access and return it', async () => {
        const enteredData = {
            firstname: 'Test',
            lastname: 'User 1',
            email: 'testu1@mail.com',
            createdById: mockUsers[0].id,
        };
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `mutation {
                    addUser(
                        firstname: "${enteredData.firstname}"
                        lastname: "${enteredData.lastname}"
                        email: "${enteredData.email}"
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
        expect(response.body.data.addUser).toBeDefined();

        const expectedData = {
            ...enteredData,
            id: MOCK_UNIQID,
            createdISO: MOCK_ISO_TIME,
            lastModifiedISO: null,
            permissions: {
                canSee: {
                    analytics: false,
                    products: false,
                    orders: false,
                    pages: false,
                    users: false,
                },
                canEdit: {
                    analytics: false,
                    products: false,
                    orders: false,
                    pages: false,
                    users: false,
                },
                canDelete: {
                    analytics: false,
                    products: false,
                    orders: false,
                    pages: false,
                    users: false,
                },
            }
        }

        const { addUser } = response.body.data;
        expectUserData(addUser, expectedData);
        expect(mockUsers).toContainEqual(expectedData);
        expect(mockWriteDataFn).toHaveBeenCalledWith(USERS_REPO_NAME, mockUsers);
        expect(mockWriteDataFn).toHaveBeenCalledWith(USER_CREDS_REPO_NAME, expect.arrayContaining([
            expect.objectContaining({ id: response.body.data.addUser.id })
        ]));
    });

    it('Should save credentials and user with permissions by user that has access and return it', async () => {
        const enteredData = {
            firstname: 'Test',
            lastname: 'User 1',
            email: 'new.user.email1@mail.com',
            createdById: mockUsers[0].id,
            permissions: {
                canSee: {
                    analytics: true,
                    products: true,
                    pages: true,
                    users: false,
                    orders: false,
                },
                canEdit: {
                    products: true,
                },
                canDelete: {
                    products: false,
                },
            }
        };

        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                variables: {
                    permissions: enteredData.permissions,
                },
                query: `mutation addUser($permissions: UserPermissionsInput) {
                    addUser(
                        firstname: "${enteredData.firstname}"
                        lastname: "${enteredData.lastname}"
                        email: "${enteredData.email}"
                        permissions: $permissions
                    ) {
                        id
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
                    }
                }`
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.addUser).toBeDefined();

        expectUserData(response.body.data.addUser, { permissions: enteredData.permissions });
        expect(mockWriteDataFn).toHaveBeenCalledWith('user-credentials', expect.arrayContaining([
            expect.objectContaining({ id: response.body.data.addUser.id })
        ]));
        expect(mockWriteDataFn).toHaveBeenCalledWith(USERS_REPO_NAME, mockUsers);
    });

    it('Should get user with same email exist error', async () => {
        expect(mockUsers).toHaveLength(7);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithoutAccessToken}`)
            .send({
                query: `mutation {
                    addUser(
                        firstname: "test name"
                        email: "johndoe@example.com"
                    ) {
                        id
                        lastname
                    }
                }`
            });

        expect(response.body.data.addUser).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.userAlreadyExists('email').message);
        expect(mockWriteDataFn).not.toHaveBeenCalledWith(USERS_REPO_NAME);
        expect(mockWriteDataFn).not.toHaveBeenCalledWith('user-credentials');
        expect(mockUsers).toHaveLength(7);
    });

    it('Should get Action forbidden error when action user has no access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithoutAccessToken}`)
            .send({
                query: `mutation {
                    addUser(
                        firstname: ""
                        email: "some@email.com"
                    ) {
                        id
                        lastname
                    }
                }`
            });

        expect(response.body.data.addUser).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);
        expect(mockWriteDataFn).not.toHaveBeenCalledWith(USERS_REPO_NAME);
        expect(mockWriteDataFn).not.toHaveBeenCalledWith('user-credentials');
    });

    it.each([
        ['empty firstname', 'firstname: "" email: ""', ApiErrorFactory.userFirstnameInvalid()],
        ['empty firstname with 1 char', 'firstname: "a" email: ""', ApiErrorFactory.userFirstnameInvalid()],
        ['invalid email', 'firstname: "some" email: ""', ApiErrorFactory.userEmailInvalid()],
        ['invalid email "asd"', 'firstname: "some" email: "asd"', ApiErrorFactory.userEmailInvalid()],
        ['invalid email "asd 1@ass.dd"', 'firstname: "some" email: "asd 1@ass.dd"', ApiErrorFactory.userEmailInvalid()],
        ['invalid email "@.dd"', 'firstname: "some" email: "@.dd"', ApiErrorFactory.userEmailInvalid()],
        ['invalid email "asd@.dd"', 'firstname: "some" email: "asd@.dd"', ApiErrorFactory.userEmailInvalid()],
    ])('Should get %s error', async (_, params, error) => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `mutation {
                    addUser(
                        ${params}
                    ) {
                        id
                        lastname
                    }
                }`
            });

        expect(response.body.data.addUser).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(error.message);

        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });
});