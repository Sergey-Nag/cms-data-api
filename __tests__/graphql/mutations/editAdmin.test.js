const mockAdmins = require('../../__mocks__/admins.json');
const mockPages = require('../../__mocks__/pages.json');
const data = require('../../../data/index.js');
const server = require('../../../index');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');
const { expectUserData } = require('../utils');
const { merge } = require('lodash');
const SessionManager = require('../../../managers/SessionManager');
const { PAGES_REPO_NAME, ADMINS_REPO_NAME } = require('../../../constants/repositoryNames');
const mockAdminsRepoName = ADMINS_REPO_NAME;
const mockPagesRepoName = PAGES_REPO_NAME;
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

describe('Edit entity mutation (editAdmin)', () => {
    const mockWriteDataFn = jest.fn();
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
                    editAdmin(
                        id: "${mockAdmins[2].id}"
                        input: {
                            firstname: "yoyoy"
                        }
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.errors[0].message).toBe(ApiErrorFactory.unauthorized().message);
        expect(response.body.data.editAdmin).toBeNull();
    });

    it('Should update a user data by user that has access and return it', async () => {
        const updateData = {
            firstname: 'new test name',
            lastname: 'new last name',
            email: 'new@email.com',
            permissions: {
                canSee: {
                    analytics: true,
                    products: true,
                    orders: true,
                    pages: true,
                    admins: true,
                    customers: true,
                }
            }
        }
        const oldUser = {...mockAdmins[2]};

        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                variables: {
                    data: updateData,
                },
                query: `mutation EDIT($data: EditAdminInput!) {
                    editAdmin(
                        id: "${mockAdmins[2].id}"
                        input: $data
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
        expect(response.body.data.editAdmin).toBeDefined();

        expectUserData(response.body.data.editAdmin, {
            ...updateData,
            lastModifiedISO: MOCK_ISO_TIME,
        }, oldUser);
        
        merge(updateData, mockAdmins[2]);
        expect(mockAdmins).toContainEqual(updateData);
        expect(mockWriteDataFn).toHaveBeenCalledWith(ADMINS_REPO_NAME, mockAdmins);
    });

    it.each([
        [
            'Should get Action forbidden error when action user has no access', 
            {
                id: mockAdmins[2].id, 
                withAccess: false,
            },
            ApiErrorFactory.actionForbidden(),
        ],
        [
            'Should get User not found error when id is wrong', 
            {
                id: 'not-existed-user-id', 
                withAccess: true,
            },
            ApiErrorFactory.userNotFound(),
        ],
        [
            'Should get User not found error when id is empty', 
            {
                id: '', 
                withAccess: true,
            },
            ApiErrorFactory.userNotFound(),
        ],
        [
            'Should get wrong token error', 
            {
                id: mockAdmins[2].id, 
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJpMGN5a3Y2b2xscmMwejh2IiwiaWF0IjoxNjk0MjM5NzY4LCJleHAiOjE2OTQyNDMzNjh9.K-eOoZ7ZRxhYyveEbVKWpoEi9d0f_9GaexxiBraYgZo'
            },
            ApiErrorFactory.unauthorized(),
        ],
    ])('%s', async (_, { id, withAccess, token }, error) => {
        const updateData = {
            firstname: 'new test name',
            lastname: 'new last name',
            email: 'other-new.mail@email.com',
            permissions: {
                canSee: {
                    analytics: true,
                    products: true,
                    orders: true,
                    pages: true,
                    admins: true,
                    customers: true,
                }
            }
        }
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${token ?? (withAccess ? userWithAccessToken : userWithoutAccessToken)}`)
            .send({
                variables: {
                    id,
                    data: updateData,
                },  
                query: `mutation EDIT($data: EditAdminInput! $id: ID!) {
                    editAdmin(
                        id: $id
                        input: $data
                    ) {
                        id
                        lastname
                    }
                }`
            });

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(error.message);
        try {
            expect(response.body.data.editAdmin).toBeNull();
        } catch(e) {
            expect(response.body.data).toBeUndefined();
        }

        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });

    it.each([
        [
            ['firstname'], ['new first name'],
        ],
        [
            ['lastname'], ['new last name'],
        ],
        [
            ['email'], ['new-awesome@mail.cc'],
        ],
        [
            ['permissions'], [{ canSee: { pages: true, admins: false } }],
        ],
        [
            ['firstname', 'permissions'],
            ['Adam', { canSee: {analytics: true}, canEdit: { analytics: true }, canDelete: { analytics: true }}],
        ],
        [
            ['lastname', 'email'],
            ['Supfursdnvasdvonacvadfvoin', 'sdffffffff@dfadf.cdc'],
        ]
    ])('Should update only provided properties: %s', async (props, values) => {
        const updateData = props.reduce((acc, prop, i) => {
            acc[prop] = values[i];
            return acc;
        }, {});
        const oldUser = {...mockAdmins[2]};
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                variables: {
                    data: updateData,
                },  
                query: `mutation EDIT($data: EditAdminInput!) {
                    editAdmin(
                        id: "${mockAdmins[2].id}"
                        input: $data
                    ) {
                        id
                        firstname
                        lastname
                        email
                        isOnline
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
        expect(response.body.data.editAdmin).toBeDefined();
        expectUserData(response.body.data.editAdmin, updateData, oldUser);
        expect(mockWriteDataFn).toHaveBeenCalled();
    });

    it.each([
        [
            ['firstname'], [''], ApiErrorFactory.userFirstnameInvalid(),
        ],
        [
            ['firstname'], [' 1 '], ApiErrorFactory.userFirstnameInvalid(),
        ],
        [
            ['email'], [''], ApiErrorFactory.userEmailInvalid(),
        ],
        [
            ['email'], ['ho ho'], ApiErrorFactory.userEmailInvalid(),
        ],
        [
            ['email'], ['johndoe@example.com'], ApiErrorFactory.userAlreadyExists('email'),
        ],
        [
            ['email'], ['abta@.ss'], ApiErrorFactory.userEmailInvalid(),
        ],
        [
            ['firstname', 'email'], ['-', 'abta@.ss'], ApiErrorFactory.userFirstnameInvalid(),
        ],
        [
            ['firstname', 'email'], ['lolo', 'abta@.ss'], ApiErrorFactory.userEmailInvalid(),
        ],
    ])('Should get validation error for ivalid props: %s', async (props, values, error) => {
        const updateData = props.reduce((acc, prop, i) => {
            acc[prop] = values[i];
            return acc;
        }, {});
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                variables: {
                    data: updateData,
                },
                query: `mutation EDIT($data: EditAdminInput!) {
                    editAdmin(
                        id: "${mockAdmins[2].id}"
                        input: $data
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.data.editAdmin).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(error.message);

        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });
});
