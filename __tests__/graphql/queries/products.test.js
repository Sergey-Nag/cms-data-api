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

describe('products query', () => {
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
                    products {
                        items {
                            id
                        }
                    }
                }`
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.products).toBeDefined();
    });

    it('Should get full products data', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `{
                    products {
                        totalItems
                        items {
                          id
                          name
                          alias
                          description
                          price
                          priceHistory {
                            price
                            createdISO
                            createdBy {
                              id
                            }
                          }
                          categories {
                            id
                            name
                            alias
                          }
                          tags
                          stock {
                            amount
                            lowStockAlert
                          }
                          characteristics {
                            name
                            value
                          }
                          options {
                            name
                            options
                          }
                          isPublished
                          coverPhotoUrl
                          photosUrl
                          createdISO
                          lastModifiedISO
                          createdBy {
                            id
                          }
                          modifiedBy {
                            id
                          }
                      }
                    }
                }
                `
            });
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.products).toBeDefined();
        
        expect(response.body.data.products).toHaveProperty('totalItems', 5);
        expect(response.body.data.products).toHaveProperty('items', mockProducts.map((prod) => {
            const { createdById, modifiedById, categoriesId, priceHistory: pHistory, ...restProd} = prod;
            const categories = mockCategories.filter(({ id }) => categoriesId.includes(id));
            const priceHistory = pHistory.map(({ price, createdById, createdISO}) => ({
                price,
                createdISO,
                createdBy: {
                    id: createdById
                }
            }));
            return {
                ...restProd,
                createdBy: {
                    id: createdById
                },
                modifiedBy: modifiedById && {
                    id: modifiedById
                },
                categories,
                priceHistory
            }
        }));
    });

    it.each([
        [
            'name',
            {
                name: 'Adidas'
            },
            [1]
        ],
        [
            'one tag',
            {
                tags: ['shoes']
            },
            [0, 1]
        ],
        [
            'three tags',
            {
                tags: ['nike', 'adidas', 'books']
            },
            [0, 1, 3]
        ],
        [
            'amount in stock less or equal 20',
            {
                stock: {
                    amount: '<= 20'
                }
            },
            [0, 1, 2, 4]
        ],
        [
            'categories',
            {
                categoriesId: ['CATtest-id-1', 'CATtest-id-5']
            },
            [0, 1, 4]
        ],
        [
            'coverPhoto is not defined',
            {
                hasCoverPhoto: false
            },
            [0, 2, 4]
        ],
        [
            'coverPhoto is defined',
            {
                hasCoverPhoto: true
            },
            [1, 3]
        ],
        [
            'photos are defined',
            {
                hasPhotos: true
            },
            [3, 4]
        ],
        [
            'photos are not defined',
            {
                hasPhotos: false
            },
            [0, 1, 2]
        ],
        [
            'defined cover photo and photos',
            {
                hasCoverPhoto: true,
                hasPhotos: true
            },
            [3]
        ],
        [
            'not defined cover photo and photos',
            {
                hasCoverPhoto: false,
                hasPhotos: false
            },
            [0, 2]
        ],
        [
            'characteristics that have weight property',
            {
                characteristics: [
                    {
                        name: 'Weight'
                    }
                ]
            },
            [0, 1, 2]
        ],
        [
            'characteristics where weight equals 0.25 kg',
            {
                characteristics: [
                    {
                        name: 'Weight',
                        value: '0.25 kg'
                    }
                ]
            },
            [2]
        ],
        [
            'characteristics where pages and materials',
            {
                characteristics: [
                    {
                        name: 'Pages',
                    },
                    {
                        name: 'Material',
                    },
                ]
            },
            [3, 4]
        ],
        // TODO: uncomment when sold property will be added to products
        // [
        //     'sold products',
        //     {
        //         sold: '> 0',
        //     },
        //     [0, 1, 2, 4]
        // ],
        [
            'price grater than 100',
            {
                price: '> 100'
            },
            [0, 1, 2, 4]
        ],
        [
            'price grater than 100 and less or equal than 199.99',
            {
                price: '> 100 && <= 199.99'
            },
            [0, 1, 4]
        ],
    ])('Should filter by %s', async (_, filter, expectedItemIndexes) => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                variables: {
                    filter,
                },
                query: `query GET ($filter: ProductFilter) {
                    products(filter: $filter) {
                        items {
                            id
                        }
                    }
                }`
            });
        
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.products.items).toEqual(
            expectedItemIndexes.map((index) => ({
                id: mockProducts[index].id
            }))
        );
    });
});
