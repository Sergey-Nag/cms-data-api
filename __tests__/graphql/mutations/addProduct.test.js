const mockAdmins = require('../../__mocks__/admins.json');
const mockProducts = require('../../__mocks__/products.json');
const mockCategories = require('../../__mocks__/categories.json');
const mockOrders = require('../../__mocks__/orders.json');
const { readData } = require('../../../data/index.js');
const server = require('../../../index');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');
const SessionManager = require('../../../managers/SessionManager');
const { ORDERS_REPO_NAME, ADMINS_REPO_NAME, PRODUCTS_REPO_NAME, CATEGORIES_REPO_NAME } = require('../../../constants/repositoryNames');

const mockAdminsRepoName = ADMINS_REPO_NAME;
const mockOrdersRepoName = ORDERS_REPO_NAME;
const mockProductsRepoName = PRODUCTS_REPO_NAME;
const mockCategoriesRepoName = CATEGORIES_REPO_NAME;

jest.mock('../../../data/index.js', () => ({
    readData: jest.fn().mockImplementation((name) => {
        if (name === mockProductsRepoName) {
            return Promise.resolve(mockProducts);
        } else if (name === mockOrdersRepoName) {
            return Promise.resolve(mockOrders);
        } else if (name === mockAdminsRepoName) {
            return Promise.resolve(mockAdmins);
        } else if (name === mockCategoriesRepoName) {
            return Promise.resolve(mockCategories);
        }
        return []
    }),
    writeData: jest.fn((data) => data),
}));


const MOCK_ISO_TIME = '2023-09-28T00:00:00.258Z'
Date.prototype.toISOString = jest.fn(() => MOCK_ISO_TIME);

describe('addProduct mutation', () => {
    // jest.retryTimes(2);
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
                query: `mutation {
                    addProduct(input: { name: "test" stock: { amount: 1 } }) {
                        id
                    }
                }`
            });

        expect(response.body.errors[0].message).toBe(ApiErrorFactory.unauthorized().message);
        expect(response.body.data.addProduct).toBeNull();
    });
    it('Should get Action forbidden error if user does not have permissions', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithoutAccessToken}`)
            .send({
                query: `mutation {
                    addProduct(input: { name: "test" stock: { amount: 1 } }) {
                        id
                    }
                }`
            });

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);
        expect(response.body.data.addProduct).toBeNull();
    });

    it.each([
        [
            'create product with minimal params and autogenerated alias',
            {
                name: 'Hello world',
                stock: {
                    amount: 1
                }
            }, {
                name: 'Hello world',
                alias: 'hello-world',
                stock: {
                    amount: 1,
                    lowStockAlert: 0
                },
            },
        ],
        [
            'create product with minimal params and provided alias',
            {
                name: 'Hello new world',
                alias: 'hello-new-worldssss',
                stock: {
                    amount: 1
                }
            }, {
                name: 'Hello new world',
                alias: 'hello-new-worldssss',
                stock: {
                    amount: 1,
                    lowStockAlert: 0
                },
            },
        ],
        [
            'create product with minimal params and numbers',
            {
                name: '1 Hello world with number',
                alias: '1-hello-world-with-number',
                stock: {
                    amount: 12,
                    lowStockAlert: 10
                },
                price: 250.25
            }, {
                name: '1 Hello world with number',
                alias: '1-hello-world-with-number',
                stock: {
                    amount: 12,
                    lowStockAlert: 10
                },
                price: 250.25,
                priceHistory: [{
                    createdBy: {
                        id: mockAdmins[0].id
                    },
                    price: 250.25
                }],
                options: null
            },
        ],
        [
            'create product with category and characteristics and options with coverPhoto and publish it',
            {
                name: 'New product with options and characteristics and published and description',
                description: 'New product with options and characteristics and published and description',
                characteristics: [
                    {
                        name: "Weight",
                        value: "16 kg"
                    }
                ],
                options: [
                    {
                        name: 'Size',
                        options: ['small', 'medium', 'large']
                    }
                ],
                categoriesId: ['CATtest-id-3', 'CATtest-id-7'],
                isPublished: true,
                stock: {
                    amount: 1115,
                    lowStockAlert: 10,
                },
                price: 12,
                coverPhoto: {
                    url: "Some cover photo url",
                    id: 'some-cover-photo-id',
                }
            }, {
                name: 'New product with options and characteristics and published and description',
                description: 'New product with options and characteristics and published and description',
                alias: 'new-product-with-options-and-characteristics-and-published-and-description',
                stock: {
                    amount: 1115,
                    lowStockAlert: 10
                },
                isPublished: true,
                categories: [
                    {
                        alias: 'electronics',
                        name: "Electronics"
                    },
                    {
                        name: 'Furniture',
                        alias: 'furniture'
                    }
                ],
                characteristics: [
                    {
                        name: "Weight",
                        value: "16 kg"
                    }
                ],
                options: [
                    {
                        name: 'Size',
                        options: ['small', 'medium', 'large']
                    }
                ],
                price: 12,
                priceHistory: [{
                    createdBy: {
                        id: mockAdmins[0].id
                    },
                    price: 12
                }],
                coverPhoto: {
                    url: "Some cover photo url",
                    id: 'some-cover-photo-id',
                    alt: null,
                    thumbUrl: null,
                    mediumUrl: null,
                    deleteUrl: null,
                    createdISO: MOCK_ISO_TIME
                }
            },
        ],
        [
            'create product with generated alias + "-1" if same alias already exist and photosUrl',
            {
                name: "Hello world",
                stock: {
                    amount: 0
                },
                photos: [
                    {
                        url: 'photo 1',
                        id: 'photo-1',
                    },
                    {
                        url: 'photo 2',
                        id: 'photo-2',
                    }, {
                        url: 'photo 3',
                        id: 'photo-3',
                        thumbUrl: 'thumbUrl',
                        mediumUrl: 'mediumUrl',
                        deleteUrl: 'deleteUrl',
                    }
                ]
            },
            {
                name: 'Hello world',
                alias: 'hello-world-1',
                stock: {
                    amount: 0,
                    lowStockAlert: 0
                },
                photos: [
                    {
                        url: 'photo 1',
                        id: 'photo-1',
                        alt: null,
                        thumbUrl: null,
                        mediumUrl: null,
                        deleteUrl: null,
                        createdISO: MOCK_ISO_TIME
                    },
                    {
                        url: 'photo 2',
                        id: 'photo-2',
                        alt: null,
                        thumbUrl: null,
                        mediumUrl: null,
                        deleteUrl: null,
                        createdISO: MOCK_ISO_TIME
                    }, {
                        url: 'photo 3',
                        id: 'photo-3',
                        alt: null,
                        thumbUrl: 'thumbUrl',
                        mediumUrl: 'mediumUrl',
                        deleteUrl: 'deleteUrl',
                        createdISO: MOCK_ISO_TIME
                    }
                ]
            }
        ],
        [
            'create product with generated alias + "-2" if same aliases already exist',
            {
                name: "Hello world",
                stock: {
                    amount: 0
                }
            },
            {
                name: 'Hello world',
                alias: 'hello-world-2',
                stock: {
                    amount: 0,
                    lowStockAlert: 0
                }
            }
        ],
        [
            'get Product already exist error',
            {
                name: 'Test product',
                alias: 'hello-world',
                stock: {
                    amount: 1
                }
            }, 
            ApiErrorFactory.productAlreadyExist('alias').message
        ],
        [
            'get Invalid alias error',
            {
                name: 'Test product',
                alias: 'hello world muchachos',
                stock: {
                    amount: 1
                }
            }, 
            ApiErrorFactory.productAliasInvalid('hello world muchachos').message
        ],
        [
            'get Invalid alias error when it is empty',
            {
                name: 'Test product',
                alias: '',
                stock: {
                    amount: 1
                }
            }, 
            ApiErrorFactory.productAliasInvalid().message
        ],
    ])('Should %s', async (_, input, expectedValue) => {
        expect([...mockProducts]).not.toContainEqual(
            expect.objectContaining({
                name: expectedValue.name,
                alias: expectedValue.alias,
            })
        )
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                variables: {
                    input,
                },
                query: `mutation ADD($input: NewProductInput!) {
                    addProduct(input: $input) {
                        id
                        name
                        alias
                        isPublished
                        description
                        categories {
                            name
                            alias
                        }
                        stock {
                            amount
                            lowStockAlert
                        }
                        characteristics {
                            name
                            value
                        }
                        price
                        priceHistory {
                            price
                            createdBy {
                                id
                            }
                        }
                        options {
                            name
                            options
                        }
                        createdISO
                        photos {
                            url
                            id
                            alt
                            thumbUrl
                            mediumUrl
                            deleteUrl
                            createdISO
                        }
                        coverPhoto {
                            url
                            id
                            alt
                            thumbUrl
                            mediumUrl
                            deleteUrl
                            createdISO
                        }
                    }
                }`
            });

        if (typeof expectedValue === 'string') {
            expect(response.body.data.addProduct).toBeNull();
            expect(response.body.errors[0].message).toBe(expectedValue);
            expect(mockProducts).not.toContainEqual(
                expect.objectContaining({
                    name: expectedValue.name,
                    alias: expectedValue.alias,
                })
            )
        } else {
            expect(response.body.errors).toBeUndefined();
            expect(response.body.data.addProduct).toEqual({
                id: expect.any(String),
                createdISO: MOCK_ISO_TIME,
                description: null,
                options: null,
                isPublished: false,
                price: 0,
                categories: [],
                characteristics: null,
                priceHistory: [{
                    createdBy: {
                        id: mockAdmins[0].id
                    },
                    price: 0
                }],
                photos: null,
                coverPhoto: null,
                ...expectedValue
            });
            expect(mockProducts).toContainEqual(
                expect.objectContaining({
                    id: response.body.data.addProduct.id,
                    name: expectedValue.name,
                    alias: expectedValue.alias,
                })
            )
        }
    });
});
