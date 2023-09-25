const mockAdmins = require('../../__mocks__/admins.json');
const mockCustomers = require('../../__mocks__/customers.json');
const mockOrders = require('../../__mocks__/orders.json');
const { readData } = require('../../../data/index.js');
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

describe('addOrder mutation', () => {
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
                query: `mutation {
                    addOrder(
                        input: {
                            customerId: "123"
                            orderProducts: [{ productId: "123", amount: 1 }]
                        }
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.addOrder).toBeDefined();
    });

    it('Should get Action forbidden error when user does not have access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithoutAccessToken}`)
            .send({
                query: `mutation {
                    addOrder(
                        input: {
                            customerId: "123"
                            orderProducts: []
                        }
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);
        expect(response.body.data.addOrder).toBeNull();
    });
    it('Should get Customer not found error when customerId was not provided', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `mutation {
                    addOrder(
                        input: {
                            orderProducts: []
                        }
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.errors[0].message).toBe(ApiErrorFactory.customerNotFound().message);
        expect(response.body.data.addOrder).toBeNull();
    });

    it.each([
        [
            'with required fields and for existing user',
            {
                customerId: mockCustomers[0].id,
                orderProducts: [
                    {
                        productId: "123",
                        amount: 1
                    }
                ],
            },
            {
                totalPrice: 11.5
            }
        ],
        [
            'with all fields for existing user',
            {
                customerId: mockCustomers[0].id,
                description: 'New description',
                orderProducts: [
                    {
                        productId: "123",
                        amount: 1
                    },
                    {
                        productId: "321",
                        amount: 1
                    },
                ],
                billingAddress: "billing address",
                shippingAddress: "shipping address",
            },
            {
                totalPrice: 23
            }
        ],
        [
            'with creating a new customer',
            {
                customer: {
                    email: 'new@email.com',
                    firstname: 'new customer'
                },
                orderProducts: [
                    {
                        productId: "ololo",
                        amount: 3
                    },
                ],
                billingAddress: "billing address",
                shippingAddress: "shipping address",
            },
            {
                totalPrice: 34.5,
            }
        ],
    ])('Should add new order %s', async (_, input, result) => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                variables: {
                    input
                },
                query: `mutation ADD($input: NewOrderInput) {
                    addOrder(
                        input: $input
                    ) {
                        id
                        customer {
                            id
                            email
                            firstname
                        }
                        orderProducts {
                            amount
                            fixedPrice
                        }
                        totalPrice
                        description
                        shippingAddress
                        billingAddress
                    }
                }`
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.addOrder).toBeDefined();

        const { addOrder } = response.body.data;

        expect(addOrder.id).toMatch(/^order-#\d+$/);
        if (input.customer) {
            expect(addOrder.customer.id).toMatch(/^C/);
            expect(addOrder.customer.email).toEqual(input.customer.email);
            expect(addOrder.customer.firstname).toEqual(input.customer.firstname);
        } else {
            expect(addOrder.customer.id).toBe(input.customerId);
        }

        if (input.orderProducts) {
            expect(addOrder.orderProducts).toEqual(
                input.orderProducts.map(({ amount }) => ({
                    amount, 
                    fixedPrice: 11.5
                }))
            );
        }
        if (result.totalPrice) {
            expect(addOrder.totalPrice).toBe(result.totalPrice);
        }
        if (input.description) {
            expect(addOrder.description).toBe(input.description);
        }
        if (input.shippingAddress) {
            expect(addOrder.shippingAddress).toBe(input.shippingAddress);
        }
        if (input.billingAddress) {
            expect(addOrder.billingAddress).toBe(input.billingAddress);
        }
    });

    it('Should get error when creating new customer with existing email', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `mutation {
                    addOrder(
                        input: {
                            orderProducts: []
                            customer: {
                                email: "${mockCustomers[0].email}"
                                firstname: "New name"
                            }
                        }
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.data.addOrder).toBeNull();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.userAlreadyExists('email').message);
    });

    it('Should get error when orderProducts is empty', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `mutation {
                    addOrder(
                        input: {
                            orderProducts: []
                            customerId: "${mockCustomers[0].email}"
                        }
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.data.addOrder).toBeNull();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.productListIsEmpty().message);
    });
});