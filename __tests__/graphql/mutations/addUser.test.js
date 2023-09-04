const mockUsers = require('../../__mocks__/users.json');
const mockPages = require('../../__mocks__/pages.json');
const data = require('../../../data/index.js');
const server = require('../../../index');
const uniqid = require('uniqid');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');
const { expectUserData } = require('../utils');

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


describe('addUser mutation', () => {
    const mockWriteDataFn = jest.fn();
    const MOCK_UNIQID = 'Useruniq';
    jest.spyOn(data, 'writeData').mockImplementation(mockWriteDataFn);
    uniqid.mockReturnValue(MOCK_UNIQID);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Should save data with proper values (without permissions) by user that has access and return it', async () => {
        const enteredData = {
            firstname: 'Test',
            lastname: 'User 1',
            email: 'testu1@mail.com',
            createdById: mockUsers[0].id,
        };
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `mutation {
                    addUser(
                        firstname: "${enteredData.firstname}"
                        lastname: "${enteredData.lastname}"
                        email: "${enteredData.email}"
                        actionUserId: "${enteredData.createdById}"
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
            isOnline: false,
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
        expect(mockWriteDataFn).toHaveBeenCalledWith('users', mockUsers);
    });

    it('Should save data with permissions by user that has access and return it', async () => {
        const enteredData = {
            firstname: 'Test',
            lastname: 'User 1',
            email: 'testu1@mail.com',
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
            .send({
                variables: {
                    permissions: enteredData.permissions,
                },
                query: `mutation addUser($permissions: UserPermissionsInput) {
                    addUser(
                        firstname: "${enteredData.firstname}"
                        lastname: "${enteredData.lastname}"
                        email: "${enteredData.email}"
                        actionUserId: "${enteredData.createdById}"
                        permissions: $permissions
                    ) {
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
        expect(mockWriteDataFn).toHaveBeenCalled();
    });

    it('Should get Action forbidden error when action user has no access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `mutation {
                    addUser(
                        firstname: ""
                        email: "some@email.com"
                        actionUserId: "${mockUsers[1].id}"
                    ) {
                        id
                        lastname
                    }
                }`
            });

            expect(response.body.data.addUser).toBeNull();
            expect(response.body.errors).toBeDefined();
            expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);

            expect(mockWriteDataFn).not.toHaveBeenCalled();
    });

    it.each([
        ['empty firstname', 'firstname: "" email: ""', ApiErrorFactory.userFirstnameInvalid()],
        ['empty firstname with 1 char', 'firstname: "a" email: ""', ApiErrorFactory.userFirstnameInvalid()],
        ['invalid email', 'firstname: "some" email: ""', ApiErrorFactory.userEmailInvalid()],
        ['invalid email "asd"', 'firstname: "some" email: "asd"', ApiErrorFactory.userEmailInvalid()],
        ['invalid email "asd 1@ass.dd"', 'firstname: "some" email: "asd 1@ass.dd"', ApiErrorFactory.userEmailInvalid()],
        ['invalid email "@.dd"', 'firstname: "some" email: "@.dd"', ApiErrorFactory.userEmailInvalid()],
        ['invalid email "asd@.dd"', 'firstname: "some" email: "asd@.dd"', ApiErrorFactory.userEmailInvalid()],
    ])('Should get %s error', async(_, params, error) => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
        .send({
            query: `mutation {
                addUser(
                    ${params}
                    actionUserId: "${mockUsers[0].id}"
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