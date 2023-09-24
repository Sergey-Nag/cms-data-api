const mockAdmins = require('../../__mocks__/admins.json');
const {readData} = require('../../../data/index.js');
const server = require('../../../index');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');
const SessionManager = require('../../../managers/SessionManager');


jest.mock('../../../data/index.js', () => ({
    readData: jest.fn().mockResolvedValue(mockAdmins),
    writeData: jest.fn((data) => data),
}));

describe('admins query', () => {
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

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should get unauthorized error if requests without Auth header', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `{
                    admins {
                        items {
                            id
                        }
                    }
                }`
            });

        expect(response.body.errors[0].message).toBe(ApiErrorFactory.unauthorized().message);
        expect(response.body.data.admins).toBeNull();
    });

    it('Should get list of users with all params', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `{
                    admins {
                        items {
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
                                firstname
                                lastname
                            }
                        }
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.admins.items).toBeDefined();
        expect(response.body.data.admins.items.length).toBe(5);

        expect(response.body.data.admins.items[0].permissions).toEqual(mockAdmins[0].permissions);
        expect(response.body.data.admins.items[1].permissions).toEqual(mockAdmins[1].permissions);

        expect(response.body.data.admins.items[0].createdBy).toBeNull();
        const { id, firstname, lastname } = mockAdmins[0];
        expect(response.body.data.admins.items[1].createdBy).toEqual({ id, firstname, lastname });
    });

    it('Should get Action forbidden error when action user has no access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithoutAccessToken}`)
            .send({
                query: `
                {
                    admins {
                        items {
                            id
                        }
                    }
                }
                `
            });

        expect(response.body.data.admins).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);
    });

    it('Should get an empty array when users are not found', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `
                {
                    admins(
                        filter: { id: "test-id-that-shouldnt-exist" }
                    ) {
                        items {
                            id
                        }
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.admins).toBeDefined();
        expect(response.body.data.admins.items.length).toBe(0);
    });

    it.each([
        ['1 user by id', `id: "${mockAdmins[1].id}"`, [mockAdmins[1]]],
        ['2 users by firstname', `firstname: "joh"`, [mockAdmins[0], mockAdmins[1]]],
        [
            '1 user by createdById and email', 
            `createdById: "${mockAdmins[0].id}" email: "${mockAdmins[2].email}"`, 
            [mockAdmins[2]]
        ],
        [
            '3 users that have edit products permissions',
            `permissions: { canEdit: { products: true } }`,
            [mockAdmins[0], mockAdmins[2], mockAdmins[3]]
        ],
        [
            '1 user that have different permissions to see data',
            `permissions: { 
                canSee: {
                    analytics: false
                    products: true
                    orders: false
                    pages: true
                    admins: false
                    customers: true
                }
            }`,
            [mockAdmins[4]]
        ],
        [
            '2 users that currently online',
            'isOnline: true',
            [mockAdmins[0], mockAdmins[1]]
        ],
        [
            '3 users that currently offline',
            'isOnline: false',
            [mockAdmins[2], mockAdmins[3], mockAdmins[4]]
        ],
        [
            '1 user without created by anyome',
            'createdById: null',
            [mockAdmins[0]]
        ],
    ])('Filter should get %s', async (_, query, expectedUsers) => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `
                {
                    admins(
                        filter: { ${query} }
                    ) {
                        items {
                            id
                            firstname
                            email
                        }
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.admins).toBeDefined();
        expect(response.body.data.admins.items.length).toBe(expectedUsers.length);

        const expected = expectedUsers.map(({id, firstname, email}) => ({ id, firstname, email }));
        expect(response.body.data.admins.items).toEqual(expected);
    });
});
