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
const { isEqual } = require('lodash');

const mockCustomersRepoName = CUSTOMERS_REPO_NAME;
const mockAdminsRepoName = ADMINS_REPO_NAME;
const mockOrdersRepoName = ORDERS_REPO_NAME;

jest.mock('../../../data/index.js', () => ({
    readData: jest.fn().mockImplementation((name) => {
        if (name === mockCustomersRepoName) {
            return Promise.resolve(mockCustomers);
        } else if (name === mockOrdersRepoName) {
            return Promise.resolve([...mockOrders]);
        } else if (name === mockAdminsRepoName) {
            return Promise.resolve(mockAdmins);
        }
        return []
    }),
    writeData: jest.fn((data) => data),
}));

const MOCK_ISO_TIME = '2023-09-25T00:00:01.258Z';
Date.prototype.toISOString = jest.fn(() => MOCK_ISO_TIME);

describe('editOrder mutation', () => {
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
                    editOrder(
                        id: "${mockOrders[0].id}"
                        input: {
                        }
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.editOrder).toBeDefined();
    });

    it('Should get Action forbidden error when user does not have access', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithoutAccessToken}`)
            .send({
                query: `mutation {
                    editOrder(
                        id: "${mockOrders[0].id}"
                        input: {
                        }
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);
        expect(response.body.data.editOrder).toBeNull();
    });
    it('Should get Order not found error when order id is wrong', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `mutation {
                    editOrder(
                        id: "non-existent-id"
                        input: {
                        }
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.errors[0].message).toBe(ApiErrorFactory.orderNotFound().message);
        expect(response.body.data.editOrder).toBeNull();
    });

    it.each([
        [
            'new description',
            mockOrders[0].id,
            {
                description: "new description for old order"
            },
        ],
        [
            'new billing and shipping adresses',
            mockOrders[1].id,
            {
                billingAddress: "new billing address for old order",
                shippingAddress: "new shipping address for old order"
            },
        ],
        [
            'assigning new customer',
            mockOrders[2].id,
            {
                customerId: mockCustomers[2].id,
            },
        ],
    ])('Should update order with %s', async (_, id, input) => {
        const oldMock = {...mockOrders.find((o) => o.id === id)};
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                variables: {
                    id,
                    input
                },
                query: `mutation ADD($id: ID! $input: EditOrderInput!) {
                    editOrder(
                        id: $id
                        input: $input
                    ) {
                        id
                        description
                        lastModifiedISO
                        createdISO
                        shippingAddress
                        billingAddress
                        customer {
                            id
                        }
                    }
                }`
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.editOrder).toBeDefined();
        const { editOrder } = response.body.data;
        
        expect(editOrder.createdISO).toBe(oldMock.createdISO);
        expect(editOrder.lastModifiedISO).not.toBe(oldMock.lastModifiedISO);
        expect(editOrder.lastModifiedISO).toBe(MOCK_ISO_TIME);

        if (input.description) {
            expect(editOrder.description).toBe(input.description);
        } else {
            expect(editOrder.description).toBe(oldMock.description);
        }
        if (input.shippingAddress) {
            expect(editOrder.shippingAddress).toBe(input.shippingAddress);
        } else {
            expect(editOrder.shippingAddress).toBe(oldMock.shippingAddress);
        }
    
        if (input.billingAddress) {
            expect(editOrder.billingAddress).toBe(input.billingAddress);
        } else {
            expect(editOrder.billingAddress).toBe(oldMock.billingAddress);
        }

        if (input.customerId) {
            expect(editOrder.customer.id).toBe(input.customerId);
        } else {
            expect(editOrder.customer.id).toBe(oldMock.customerId);
        }
    });

    it.each([
        [
            'add new status',
            {
                add: {
                    status: 'VERIFIED',
                    description: "Order products are verified"
                }
            },
        ],
        [
            'edit existing status',
            {
                edit: {
                    index: 0,
                    input: {
                        status: 'VERIFIED',
                        description: "Order products are verified"
                    }
                }
            },
        ],
        [
            'remove one status',
            {
                removeByIndexes: [1]
            },
        ],
        [
            'add one more and delete first one',
            {
                add: {
                    status: 'CANCELED',
                    description: 'Order canceled'
                },
                removeByIndexes: [0]
            },
        ],
    ])('Order status: %s', async (_, editStatus) => {
        const oldHistoryItems = [...mockOrders[0].statusHistory]
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                variables: {
                    editStatus
                },
                query: `mutation ADD($editStatus: EditStatusHistory) {
                    editOrder(
                        id: "${mockOrders[0].id}"
                        input: {
                            editStatus: $editStatus
                        }
                    ) {
                        id
                        lastModifiedISO
                        statusHistory {
                            status
                            createdISO
                            description
                            lastModifiedISO
                            createdBy {
                                ... on Admin {
                                    id
                                }
                                ... on Customer {
                                    id
                                }
                            }
                        }
                    }
                }`
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.editOrder).toBeDefined();
        const { editOrder } = response.body.data;

        if (editStatus.add) {
            const lastStatus = editOrder.statusHistory.at(-1);
            expect(lastStatus).toEqual({
                status: editStatus.add.status,
                description: editStatus.add.description,
                createdISO: MOCK_ISO_TIME,
                lastModifiedISO: null,
                createdBy: {
                    id: mockAdmins[0].id
                }
            });
        }

        if (editStatus.edit) {
            const { index, input } = editStatus.edit;
            const editedStatus = editOrder.statusHistory[index];
            expect(editedStatus).toEqual({
                status: input.status,
                description: input.description,
                createdISO: oldHistoryItems[index].createdISO,
                lastModifiedISO: MOCK_ISO_TIME,
                createdBy: {
                    id: mockAdmins[0].id
                }
            });
        }

        if (editStatus.removeByIndexes) {
            editStatus.removeByIndexes.forEach((index) => {
                expect(
                    editOrder.statusHistory[index] === undefined || 
                    !isEqual(editOrder.statusHistory[index], oldHistoryItems[index]) 
                ).toBe(true)
            });
        }
    })
});