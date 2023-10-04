const mockAdmins = require('../../__mocks__/admins.json');
const mockCustomers = require('../../__mocks__/customers.json');
const mockOrders = require('../../__mocks__/orders.json');
const {readData} = require('../../../data/index.js');
const server = require('../../../index');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');
const SessionManager = require('../../../managers/SessionManager');
const { CUSTOMERS_REPO_NAME, ORDERS_REPO_NAME, ADMINS_REPO_NAME } = require('../../../constants/repositoryNames');

const mockCustomersRepoName = CUSTOMERS_REPO_NAME;
const mockAdminsRepoName = ADMINS_REPO_NAME;
const mockOrdersRepoName = ORDERS_REPO_NAME;

jest.mock('../../../data/index.js', () => ({
    readData: jest.fn().mockImplementation((name) => {
        if (name === mockCustomersRepoName) {
            return Promise.resolve(mockCustomers);
        } else if (name === mockOrdersRepoName) {
            return Promise.resolve(mockOrders);
        } else if (name === mockAdminsRepoName) {
            return Promise.resolve(mockAdmins);
        }
        return []
    }),
    writeData: jest.fn((data) => data),
}));

describe('customer query', () => {
    jest.retryTimes(2);
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
    
    it('Should not get unauthorized error if requests without Auth header', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `query {
                    customer(
                        find: { id: "${mockCustomers[0].id}" }
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.customer).toBeDefined();
    });

    it('Should get customer by admin that has access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `{
                    customer(find: { id: "${mockCustomers[0].id}"}) {
                        id
                        firstname
                        lastname
                        email
                    }
                }
                `
            });
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.customer).toBeDefined();
        expect(response.body.data.customer).toEqual(mockCustomers[0]);
    });
    
    it('Should get customer\'s orders by admin that has access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `{
                    customer(find: { id: "${mockCustomers[0].id}"}) {
                        id
                        orders {
                            id
                            description
                            orderProducts {
                                product {
                                    name
                                }
                                amount
                            }
                            shippingAddress
                            billingAddress
                            totalPrice
                            currentStatus
                        }
                    }
                }
                `
            });
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.customer).toHaveProperty('id', mockCustomers[0].id);

        const {
            id,
            description,
            orderProductsId,
            shippingAddress,
            billingAddress,
        } = mockOrders[0];

        expect(response.body.data.customer).toHaveProperty('orders', [{
            id,
            description,
            orderProducts: [
                {
                    amount: 2,
                    product: null
                },
                {
                    amount: 3,
                    product: null
                },
            ],
            shippingAddress,
            billingAddress,
            currentStatus: "NEW",
            totalPrice: 57.5
        }]);
    });
    
    it('Should get Action forbidden error when action user has no access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithoutAccessToken}`)
            .send({
                query: `
                    {
                        customer(find: { id: "${mockCustomers[0].id}" }) {
                            id
                        }
                    }
                `
            });

        expect(response.body.data.customer).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);
    });

    it.each([
        ['by firstname', `firstname: "joh"`, mockCustomers[0]],
        [
            'by full email', 
            `email: "${mockCustomers[1].email}"`, 
            mockCustomers[1]
        ],
        [
            'by partial email',
            `email: "example.com"`,
            mockCustomers[2]
        ],
    ])('Should get customer %s', async (_, query, expectedUser) => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `
                {
                    customer(
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
        expect(response.body.data.customer).toBeDefined();

        const { id, firstname, email } = expectedUser;
        expect(response.body.data.customer).toEqual({ id, firstname, email });
    });
});