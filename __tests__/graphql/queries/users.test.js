const mockUsers = require('../../__mocks__/users.json');
const {readData} = require('../../../data/index.js');
const server = require('../../../index');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');
const SessionManager = require('../../../managers/SessionManager');
const { mockSessionForUser } = require('../../utils');
jest.mock('../../../managers/SessionManager');

const ACCESS_TOKEN = 'access-users-token';

jest.mock('../../../data/index.js', () => ({
    readData: jest.fn().mockResolvedValue(mockUsers),
    writeData: jest.fn((data) => data),
}));

describe('users query', () => {
    beforeAll(() => {
        jest.clearAllMocks();
    });

    it('Should get unauthorized error if requests without Auth header', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `{
                    users {
                        id
                    }
                }`
            });

        expect(response.body.errors[0].message).toBe(ApiErrorFactory.unauthorized().message);
        expect(response.body.data.users).toBeNull();
    });

    it('Should get list of users with all params', async () => {
        mockSessionForUser(mockUsers[0].id, ACCESS_TOKEN)
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `{
                    users {
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
        expect(response.body.data.users).toBeDefined();
        expect(response.body.data.users.length).toBe(5);

        expect(response.body.data.users[0].permissions).toEqual(mockUsers[0].permissions);
        expect(response.body.data.users[1].permissions).toEqual(mockUsers[1].permissions);

        expect(response.body.data.users[0].createdBy).toBeNull();
        const { id, firstname, lastname } = mockUsers[0];
        expect(response.body.data.users[1].createdBy).toEqual({ id, firstname, lastname });
    });

    it('Should get Action forbidden error when action user has no access', async () => {
        mockSessionForUser(mockUsers[1].id, ACCESS_TOKEN)
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `
                {
                    users {
                        id
                    }
                }
                `
            });

        expect(response.body.data.users).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);
    });

    it('Should get an empty array when users are not found', async () => {
        mockSessionForUser(mockUsers[0].id, ACCESS_TOKEN)
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `
                {
                    users(id: "test-id-that-shouldnt-exist") {
                        id
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.users).toBeDefined();
        expect(response.body.data.users.length).toBe(0);
    });

    it.each([
        ['1 user by id', `id: "${mockUsers[1].id}"`, [mockUsers[1]]],
        ['2 users by firstname', `firstname: "joh"`, [mockUsers[1], mockUsers[4]]],
        [
            '1 user by createdById and email', 
            `createdById: "test-2" email: "eleanor.j@example.com"`, 
            [mockUsers[3]]
        ],
        [
            '3 users that have edit products permissions',
            `permissions: { canEdit: { products: true } }`,
            [mockUsers[0], mockUsers[3], mockUsers[4]]
        ],
        [
            '1 user that have different permissions to see data',
            `permissions: { 
                canSee: {
                    analytics: true,
                    products: true,
                    orders: false,
                    pages: true,
                    users: false
                }
            }`,
            [mockUsers[4]]
        ],
    ])('Filter should get %s', async (_, query, expectedUsers) => {
        mockSessionForUser(mockUsers[0].id, ACCESS_TOKEN)
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
            .send({
                query: `
                {
                    users(
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
        expect(response.body.data.users).toBeDefined();
        expect(response.body.data.users.length).toBe(expectedUsers.length);

        const expected = expectedUsers.map(({id, firstname, email}) => ({ id, firstname, email }));
        expect(response.body.data.users).toEqual(expected);
    });
});
