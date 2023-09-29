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

describe('product query', () => {
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
                    product(find: {}) {
                        id
                    }
                }`
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.product).toBeNull();
    });

    it.each([
        [
            'a product by full name',
            {
                name: 'Adidas Running Shoes'
            },
            1
        ],
        [
            'product not found error with non-existed name',
            {
                name: 'something that not exist'
            },
            ApiErrorFactory.productNotFound().message
        ],
        [
            'first product by tags',
            {
                tags: ['nike', 'adidas', 'books']
            },
            0
        ],
        [
            'coverPhoto is defined',
            {
                hasCoverPhoto: true
            },
            1
        ],
        [
            'photos are defined',
            {
                hasPhotos: true
            },
            3
        ],
        [
            'defined cover photo and photos',
            {
                hasCoverPhoto: true,
                hasPhotos: true
            },
            3
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
            2
        ],
        [
            'characteristics with materials',
            {
                characteristics: [
                    {
                        name: 'Material',
                    },
                ]
            },
            4
        ],
    ])('Should get %s', async (_, find, expectedItemIndex) => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                variables: {
                    find,
                },
                query: `query GET ($find: ProductFilter) {
                    product(find: $find) {
                        id
                    }
                }`
            });
        
        if (typeof expectedItemIndex === 'number') {
            expect(response.body.errors).toBeUndefined();
            expect(response.body.data.product).toHaveProperty('id', mockProducts[expectedItemIndex].id);
        } else if (typeof expectedItemIndex === 'string') {
            expect(response.body.data.product).toBeNull();
            expect(response.body.errors[0].message).toBe(expectedItemIndex);
        }
    });
});
