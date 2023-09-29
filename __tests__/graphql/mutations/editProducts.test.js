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
                    editProduct(id: "${mockProducts[0].id}" input: { name: "test" stock: { amount: 1 } }) {
                        id
                    }
                }`
            });

        expect(response.body.errors?.[0].message).toBe(ApiErrorFactory.unauthorized().message);
        expect(response.body.data.editProduct).toBeNull();
    });
    it('Should get Action forbidden error if user does not have permissions', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithoutAccessToken}`)
            .send({
                query: `mutation {
                    editProduct(id: "${mockProducts[0].id}" input: { name: "test" stock: { amount: 1 } }) {
                        id
                    }
                }`
            });

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);
        expect(response.body.data.editProduct).toBeNull();
    });

    it.each([
        [
            'change only name',
            {
                name: 'New changed Name',
            }, {
                name: 'New changed Name',
                modifiedBy: {
                    id: mockAdmins[0].id,
                },
            },
            {...mockProducts[2]}
        ],
        [
            'change alias and price',
            {
                alias: 'some-new-value',
                price: 225.12
            }, 
            {
                name: 'New changed Name',
                alias: 'some-new-value',
                price: 225.12,
                priceHistory: [
                    {
                        price: mockProducts[2].priceHistory[0].price,
                        createdISO: mockProducts[2].priceHistory[0].createdISO,
                        createdBy: {
                            id: mockProducts[2].priceHistory[0].createdById,
                        },
                    },
                    {
                        price: 225.12,
                        createdISO: MOCK_ISO_TIME,
                        createdBy: {
                            id: mockAdmins[0].id
                        }
                    }
                ],
                modifiedBy: {
                    id: mockAdmins[0].id,
                },
            },
            {...mockProducts[2]}
        ],
        [
            'change description, low stock alert and unpublish',
            {
                description: 'new description',
                stock: {
                    lowStockAlert: 100
                },
                isPublished: false
            }, 
            {
                description: 'new description',
                stock: {
                    amount: mockProducts[3].stock.amount,
                    lowStockAlert: 100
                },
                isPublished: false
            },
            {...mockProducts[3]}
        ],
        [
            'change stock amount and characteristics',
            {
                stock: {
                    amount: 200
                },
                characteristics: [
                    {
                        name: 'Weight',
                        value: '123kg'
                    },
                    {
                        name: 'Char 2',
                        value: 'val 2'
                    },
                ]
            }, 
            {
                stock: {
                    lowStockAlert: 100,
                    amount: 200
                },
                characteristics: [
                    {
                        name: 'Weight',
                        value: '123kg'
                    },
                    {
                        name: 'Char 2',
                        value: 'val 2'
                    },
                ],
                description: 'new description',
                isPublished: false
            },
            {...mockProducts[3]}
        ],
        [
            'overwrite characteristics and add options',
            {
                characteristics: [
                    {
                        name: 'Char 3',
                        value: 'val 2, val 3'
                    },
                ],
                options: [
                    {
                        name: 'Color',
                        options: ['Green', 'Blue']
                    }
                ]
            }, 
            {
                stock: {
                    lowStockAlert: 100,
                    amount: 200
                },
                characteristics: [
                    {
                        name: 'Char 3',
                        value: 'val 2, val 3'
                    },
                ],
                options: [
                    {
                        name: 'Color',
                        options: ['Green', 'Blue']
                    }
                ],
                description: 'new description',
                isPublished: false
            },
            {...mockProducts[3]}
        ],
        [
            'overwrite description change options and remove photos',
            {
                options: [
                    {
                        name: 'Memory',
                        options: ['500gb', '1Tb', '2Tb']
                    }
                ],
                description: mockProducts[3].description,
                photosUrl: null,
                coverPhotoUrl: null,
            }, 
            {
                stock: {
                    lowStockAlert: 100,
                    amount: 200
                },
                characteristics: [
                    {
                        name: 'Char 3',
                        value: 'val 2, val 3'
                    },
                ],
                options: [
                    {
                        name: 'Memory',
                        options: ['500gb', '1Tb', '2Tb']
                    }
                ],
                isPublished: false,
                photosUrl: null,
                coverPhotoUrl: null,
            },
            {...mockProducts[3]}
        ],
        [
            'get Error when try to change alias that already exist',
            {
                alias: mockProducts[0].alias
            },
            ApiErrorFactory.productAlreadyExist('alias').message,
            {...mockProducts[3]}
        ],
    ])('Should %s', async (_, input, expectedValue, productToChange) => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                variables: {
                    input,
                },
                query: `mutation ADD($input: EditProductInput!) {
                    editProduct(id: "${productToChange.id}" input: $input) {
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
                            createdISO
                        }
                        options {
                            name
                            options
                        }
                        createdISO
                        lastModifiedISO
                        modifiedBy {
                            id
                        }
                        photosUrl
                        coverPhotoUrl
                    }
                }`
            });

        if (typeof expectedValue === 'string') {
            expect(response.body.data.editProduct).toBeNull();
            expect(response.body.errors[0].message).toBe(expectedValue);
        } else {
            expect(response.body.errors).toBeUndefined();
            expectProductChanges(response.body.data.editProduct, productToChange, expectedValue);
        }
    });

    it('Should get product not found if id is non-existed', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `mutation {
                    editProduct(id: "not-existed-id" input: { name: "test" stock: { amount: 1 } }) {
                        id
                    }
                }`
            });

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.productNotFound().message);
        expect(response.body.data.editProduct).toBeNull();
    })
});

function expectProductChanges(editProduct, productToChange, expectedValue) {
    expect(editProduct).toEqual({
        id: productToChange.id,
        createdISO: productToChange.createdISO,
        description: productToChange.description,
        options: productToChange.options,
        isPublished: productToChange.isPublished,
        price: productToChange.price,
        categories: productToChange.categoriesId?.map((id) => {
            const {name, alias} = mockCategories.find(cat => cat.id === id);
            return {
                name, alias
            }
        }) ?? null,
        characteristics: productToChange.characteristics,
        priceHistory: productToChange.priceHistory.map(({ createdISO, createdById, price }) => ({
            price,
            createdISO,
            createdBy: {
                id: createdById
            }
        })),
        lastModifiedISO: productToChange.lastModifiedISO,
        modifiedBy: {
            id: productToChange.modifiedById,
        },
        lastModifiedISO: MOCK_ISO_TIME,
        stock: productToChange.stock,
        name: productToChange.name,
        alias: productToChange.alias,
        photosUrl: productToChange.photosUrl,
        coverPhotoUrl: productToChange.coverPhotoUrl,
        ...expectedValue
    });
}
