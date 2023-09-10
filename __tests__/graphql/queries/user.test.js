const mockUsers = require('../../__mocks__/users.json');
const {readData} = require('../../../data/index.js');
const server = require('../../../index');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');
const { mockSessionForUser } = require('../../utils');

jest.mock('../../../data/index.js', () => ({
    readData: jest.fn().mockResolvedValue(mockUsers),
    writeData: jest.fn((data) => data),
}));

describe('user query', () => {
    beforeAll(() => {
        jest.clearAllMocks();
    });
    
    
    it('Should get unauthorized error if requests without Auth header', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `query {
                    user(
                        id: "${mockUsers[2].id}"
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.errors[0].message).toBe(ApiErrorFactory.unauthorized().message);
        expect(response.body.data.user).toBeNull();
    });

    it('Should get user itself by id with all params and isOnline true when session is active while has access', async () => {
        const {accessToken, endSession} = mockSessionForUser(mockUsers[0].id);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                query: `{
                    user(id: "${mockUsers[0].id}") {
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
                            firstname
                            lastname
                        }
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.user).toBeDefined();
        const { createdById, ...userData} = mockUsers[0];
        expect(response.body.data.user).toEqual({
            ...userData,
            isOnline: true,
            createdBy: null
        });
        endSession();
    });
    
    it('Should get Action forbidden error when action user has no access', async () => {
        const {accessToken, endSession} = mockSessionForUser(mockUsers[1].id);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                query: `
                    {
                        user(id: "${mockUsers[0].id}") {
                            id
                            createdBy {
                                id
                            }
                        }
                    }
                `
            });

        expect(response.body.data.user).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);
        endSession();
    });

    it('Should get error when user is not found', async () => {
        const {accessToken, endSession} = mockSessionForUser(mockUsers[0].id);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                query: `
                    {
                        user(id: "test-id-that-shouldnt-exist") {
                            id
                            createdBy {
                                id
                            }
                        }
                    }
                `
            });

        expect(response.body.data.user).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.userNotFound().message);
        endSession();
    });

    it('Should get error when user is not found without query data', async () => {
        const {accessToken, endSession} = mockSessionForUser(mockUsers[0].id);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                query: `
                    {
                        user {
                            id
                            createdBy {
                                id
                            }
                        }
                    }
                `
            });

        expect(response.body.data.user).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.userNotFound().message);
        endSession();
    });

    it.each([
        ['by firstname', `firstname: "joh"`, mockUsers[1]],
        [
            'by createdById and email', 
            `createdById: "test-2" email: "eleanor.j@example.com"`, 
            mockUsers[3]
        ],
        [
            'that has edit products permissions',
            `permissions: { canEdit: { products: true } }`,
            mockUsers[0]
        ],
        [
            'that has different permissions to see data',
            `permissions: { 
                canSee: {
                    analytics: true,
                    products: true,
                    orders: false,
                    pages: true,
                    users: false
                }
            }`,
            mockUsers[4]
        ],
        [
            'that is currently online',
            'isOnline: true',
            mockUsers[0]
        ],
        [
            'that is currently offline',
            'isOnline: false',
            mockUsers[1]
        ]
    ])('Should get user %s', async (_, query, expectedUser) => {
        const {accessToken, endSession} = mockSessionForUser(mockUsers[0].id);
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                query: `
                {
                    user(
                        ${query}
                    ) {
                        id
                        firstname
                        email
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.user).toBeDefined();

        const { id, firstname, email } = expectedUser;
        expect(response.body.data.user).toEqual({ id, firstname, email });
        endSession();
    });
});