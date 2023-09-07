const mockUsers = require('../../__mocks__/users.json');
const {readData} = require('../../../data/index.js');
const server = require('../../../index');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');


jest.mock('../../../data/index.js', () => ({
    readData: jest.fn().mockResolvedValue(mockUsers),
    writeData: jest.fn((data) => data),
}));

describe('user query', () => {
    beforeAll(() => {
        jest.clearAllMocks();
    });

    it('Should get specific user by id with all params', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
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
            createdBy: null
        });
    });

    it('Should get specific user by id when action user has access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `
                    {
                        user(id: "${mockUsers[1].id}" actionUserId: "${mockUsers[0].id}") {
                            id
                            createdBy {
                                id
                            }
                        }
                    }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.user).toEqual({
            id: mockUsers[1].id,
            createdBy: {
                id: mockUsers[0].id
            }
        });
    });
    
    it('Should get Action forbidden error when action user has no access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `
                    {
                        user(id: "${mockUsers[0].id}" actionUserId: "${mockUsers[1].id}") {
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
    });

    it('Should get error when user is not found', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
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
    });

    it('Should get error when user is not found without query data', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
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
    ])('Should get user %s', async (_, query, expectedUser) => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
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
    });
});