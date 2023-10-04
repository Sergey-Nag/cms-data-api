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

describe('customer query', () => {
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
                    orders {
                        items {
                            id
                        }
                    }
                }`
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.orders).toBeDefined();
    });

    it('Should get Action forbidden error if user do not have access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithoutAccessToken}`)
            .send({
                query: `query {
                    orders {
                        items {
                            id
                        }
                    }
                }`
            });

        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);
        expect(response.body.data.orders).toBeNull();
    });

    it('Should get orders with all data by admin that has access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `{
                    orders {
                        items {
                            id
                            description
                            orderProducts {
                                product {
                                    name
                                }
                                fixedPrice
                                amount
                            }
                            shippingAddress
                            billingAddress
                            totalPrice
                            currentStatus
                            customer {
                                id
                                firstname
                                lastname
                                email
                                orders {
                                    id
                                }
                            }
                            statusHistory {
                                status
                                description
                                createdISO
                                createdBy {
                                    ... on Customer {
                                        id
                                        firstname
                                    }
                                    ... on Admin {
                                        permissions {
                                            canSee {
                                                orders
                                            }
                                        }
                                    }
                                }
                            }
                            currentStatus
                            createdISO
                            lastModifiedISO
                        }
                    }
                }
                `
            });
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.orders).toBeDefined();
        expect(response.body.data.orders.items).toHaveLength(3);
        const { orderProductsId, customerId, statusHistory, ...firstOrder} = mockOrders[0];
        const customer = mockCustomers[0];
        expect(response.body.data.orders.items[0]).toEqual({
            ...firstOrder,
            customer: {
                ...customer,
                orders: [
                    {
                        id: response.body.data.orders.items[0].id
                    }
                ]
            },
            currentStatus: 'NEW',
            totalPrice: 57.5,
            orderProducts: [
                {
                    product: null,
                    fixedPrice: 11.5,
                    amount: 2
                },
                {
                    product: null,
                    fixedPrice: 11.5,
                    amount: 3
                },
            ],
            statusHistory: [
                {
                    status: 'NEW',
                    description: statusHistory[0].description,
                    createdISO: statusHistory[0].createdISO,
                    createdBy: {
                        id: customer.id,
                        firstname: customer.firstname
                    }
                }
            ],
        })
    });

    it.each([
        [
            'by description that contains "new"', 
            {
                filter: {
                    description: 'new'
                }
            },
            [0],
            {
                end: null,
                itemsLeft: null
            }
        ],
        [
            'by totalPrice that greater than 100', 
            {
                filter: {
                    totalPrice: '> 100'
                }
            },
            [1],
            {
                end: null,
                itemsLeft: null
            }
        ],
        [
            'by status is CANCELED', 
            {
                filter: {
                    currentStatus: 'CANCELED'
                }
            },
            [2],
            {
                end: null,
                itemsLeft: null
            }
        ],
        [
            'that sorted by date DESC and paginated 1 page', 
            {
                sort: [
                    {
                        field: 'createdISO',
                        order: "DESC"
                    }
                ],
                pagination: {
                    start: 0,
                    amount: 1
                }
            },
            [2],
            {
                end: 1,
                itemsLeft: 2
            }
        ],
        [
            'that sorted by date DESC and paginated 2 page', 
            {
                sort: [
                    {
                        field: 'createdISO',
                        order: "DESC"
                    }
                ],
                pagination: {
                    start: 1,
                    amount: 1
                }
            },
            [1],
            {
                end: 2,
                itemsLeft: 1
            }
        ],
        [
            'that sorted by date DESC and paginated 3 page', 
            {
                sort: [
                    {
                        field: 'createdISO',
                        order: "DESC"
                    }
                ],
                pagination: {
                    start: 2,
                    amount: 1
                }
            },
            [0],
            {
                end: 3,
                itemsLeft: 0
            }
        ],
    ])('Should get orders %s', async (_, variables, expectedIndexes, pagination) => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                variables,
                query: `
                query GET($sort: [Sort] $filter: OrdersFilter $pagination: Pagination) {
                    orders(filter: $filter sort: $sort pagination: $pagination) {
                        items {
                            id
                        }
                        end
                        itemsLeft
                    }
                }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.orders).toBeDefined();
        const expectedOrders = expectedIndexes.map((index) => ({ id: mockOrders[index].id }));
        expect(response.body.data.orders.items).toEqual(expectedOrders);
        expect(response.body.data.orders).toHaveProperty('end', pagination.end);
        expect(response.body.data.orders).toHaveProperty('itemsLeft', pagination.itemsLeft);
    });
});