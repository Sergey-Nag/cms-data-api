const mockAdmins = require('../../__mocks__/admins.json');
const {readData} = require('../../../data/index.js');
const server = require('../../../index');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');
const { mockSessionForUser } = require('../../utils');
const SessionManager = require('../../../managers/SessionManager');

jest.mock('../../../data/index.js', () => ({
    readData: jest.fn().mockResolvedValue(mockAdmins),
    writeData: jest.fn((data) => data),
}));

describe('admin query', () => {
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

    beforeAll(() => {
        jest.clearAllMocks();
    });
    
    it('Should get unauthorized error if requests without Auth header', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `query {
                    admin(
                        find: { id: "${mockAdmins[2].id}" }
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.errors[0].message).toBe(ApiErrorFactory.unauthorized().message);
        expect(response.body.data.admin).toBeNull();
    });

    it('Should get user itself by id with all params and isOnline true when session is active while has access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `{
                    admin(find: { id: "${mockAdmins[0].id}"}) {
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
                        modifiedBy {
                            id
                        }
                    }
                }
                `
            });
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.admin).toBeDefined();
        const { createdById, modifiedById, _secret, ...userData} = mockAdmins[0];
        expect(response.body.data.admin).toEqual({
            ...userData,
            modifiedBy: null,
            isOnline: true,
            createdBy: null
        });
    });
    
    it('Should get Action forbidden error when action user has no access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithoutAccessToken}`)
            .send({
                query: `
                    {
                        admin(find: { id: "${mockAdmins[0].id}" }) {
                            id
                            createdBy {
                                id
                            }
                        }
                    }
                `
            });

        expect(response.body.data.admin).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);
    });

    it('Should get error when user is not found', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `
                    {
                        admin(find: { id: "test-id-that-shouldnt-exist" }) {
                            id
                            createdBy {
                                id
                            }
                        }
                    }
                `
            });

        expect(response.body.data.admin).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.userNotFound().message);
    });

    it('Should get null when user is not found without query data', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `
                    {
                        admin(find: {}) {
                            id
                            createdBy {
                                id
                            }
                        }
                    }
                `
            });

        expect(response.body.data.admin).toBeNull();
        expect(response.body.errors).toBeUndefined();
    });

    it.each([
        ['by firstname', `firstname: "joh"`, mockAdmins[0]],
        [
            'by createdById and email', 
            `createdById: "${mockAdmins[0].id}" email: "${mockAdmins[4].email}"`, 
            mockAdmins[4]
        ],
        [
            'that has edit products permissions',
            `permissions: { canEdit: { products: true } }`,
            mockAdmins[0]
        ],
        [
            'that has different permissions to see data',
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
            mockAdmins[4]
        ],
        [
            'that is currently online',
            'isOnline: true',
            mockAdmins[0]
        ],
        [
            'that is currently offline',
            'isOnline: false',
            mockAdmins[2]
        ]
    ])('Should get user %s', async (_, query, expectedUser) => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `
                {
                    admin(
                        find: {${query}}
                    ) {
                        id
                        firstname
                        email
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.admin).toBeDefined();

        const { id, firstname, email } = expectedUser;
        expect(response.body.data.admin).toEqual({ id, firstname, email });
    });
});