const mockAdmins = require('../../__mocks__/admins.json');
const mockPages = require('../../__mocks__/pages.json');
const data = require('../../../data/index.js');
const server = require('../../../index');
const uniqid = require('uniqid');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');
const { expectUserData } = require('../utils');
const SessionManager = require('../../../managers/SessionManager');
const { PAGES_REPO_NAME, USER_CREDS_REPO_NAME, ADMINS_REPO_NAME } = require('../../../constants/repositoryNames');
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


describe('Add entity mutation (addAdmin)', () => {
    const mockWriteDataFn = jest.fn();
    const MOCK_UNIQID = 'Useruniq';
    jest.spyOn(data, 'writeData').mockImplementation(mockWriteDataFn);
    uniqid.mockReturnValue(MOCK_UNIQID);
    
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
                    addAdmin(
                        input: {
                            firstname: "test"
                            lastname: "test"
                            email: "test"
                        }
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.errors[0].message).toBe(ApiErrorFactory.unauthorized().message);
        expect(response.body.data.addAdmin).toBeNull();
    });

    it('Should get Action forbidden error when action user has no access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithoutAccessToken}`)
            .send({
                query: `mutation {
                    addAdmin(
                        input: {
                            firstname: ""
                            email: "some@email.com"
                        }
                    ) {
                        id
                        lastname
                    }
                }`
            });

        expect(response.body.data.addAdmin).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);
        expect(mockWriteDataFn).not.toHaveBeenCalledWith(ADMINS_REPO_NAME);
    });

    it('Should save user with proper values (without permissions) by user that has access and return it', async () => {
        const enteredData = {
            firstname: 'Test',
            lastname: 'User 1',
            email: 'testu1@mail.com',
            createdById: mockAdmins[0].id,
        };
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `mutation {
                    addAdmin(
                        input: {
                            firstname: "${enteredData.firstname}"
                            lastname: "${enteredData.lastname}"
                            email: "${enteredData.email}"
                        }
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
                                admins
                                customers
                            }
                            canEdit {
                                analytics
                                products
                                orders
                                pages
                                admins
                                customers
                            }
                            canDelete {
                                analytics
                                products
                                orders
                                pages
                                admins
                                customers
                            }
                        }
                        createdBy {
                            id
                        }
                    }
                }`
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.addAdmin).toBeDefined();

        const expectedData = {
            ...enteredData,
            id: MOCK_UNIQID,
            createdISO: MOCK_ISO_TIME,
            modifiedById: null,
            lastModifiedISO: null,
            permissions: {
                canSee: {
                    analytics: false,
                    products: false,
                    orders: false,
                    pages: false,
                    admins: false,
                    customers: false,
                },
                canEdit: {
                    analytics: false,
                    products: false,
                    orders: false,
                    pages: false,
                    admins: false,
                    customers: false,
                },
                canDelete: {
                    analytics: false,
                    products: false,
                    orders: false,
                    pages: false,
                    admins: false,
                    customers: false,
                },
            }
        }

        const { addAdmin } = response.body.data;
        expectUserData(addAdmin, expectedData);
        expect(mockAdmins).toContainEqual(
            expect.objectContaining({
                id: addAdmin.id,
                firstname: addAdmin.firstname,
                lastname: addAdmin.lastname,
                permissions: addAdmin.permissions,
                createdById: addAdmin.createdBy.id
            })
        )
        expect(mockWriteDataFn).toHaveBeenCalledWith(ADMINS_REPO_NAME, mockAdmins);
    });

    it('Should save user with permissions by user that has access and return it', async () => {
        const enteredData = {
            firstname: 'Test',
            lastname: 'User 1',
            email: 'new.user.email1@mail.com',
            createdById: mockAdmins[0].id,
            permissions: {
                canSee: {
                    analytics: true,
                    products: true,
                    pages: true,
                    admins: false,
                    customers: true,
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
                    addAdmin(
                        input: {
                            firstname: "${enteredData.firstname}"
                            lastname: "${enteredData.lastname}"
                            email: "${enteredData.email}"
                            permissions: $permissions
                        }
                    ) {
                        id
                        permissions {
                            canSee {
                                analytics
                                products
                                orders
                                pages
                                admins
                                customers
                            }
                            canEdit {
                                analytics
                                products
                                orders
                                pages
                                admins
                                customers
                            }
                            canDelete {
                                analytics
                                products
                                orders
                                pages
                                admins
                                customers
                            }
                        }
                    }
                }`
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.addAdmin).toBeDefined();

        expectUserData(response.body.data.addAdmin, { permissions: enteredData.permissions });
        expect(mockWriteDataFn).toHaveBeenCalledWith(ADMINS_REPO_NAME, mockAdmins);
    });

    it('Should get user with same email exist error', async () => {
        expect(mockAdmins).toHaveLength(7);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `mutation {
                    addAdmin(
                        input: {
                            firstname: "test name"
                            email: "${mockAdmins[2].email}"
                        }
                    ) {
                        id
                        firstname
                        lastname
                    }
                }`
            });

        expect(response.body.data.addAdmin).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.userAlreadyExists('email').message);
        expect(mockWriteDataFn).not.toHaveBeenCalledWith(ADMINS_REPO_NAME);
        expect(mockAdmins).toHaveLength(7);
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
                    addAdmin(
                        input: { ${params} }
                    ) {
                        id
                        lastname
                    }
                }`
            });

        expect(response.body.data.addAdmin).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(error.message);

        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });
});