const server = require('../index.js');
const supertest = require('supertest');
const data = require('../data/index.js');
const { GRAPH_ENDPOINT } = require('./constants.js');

jest.mock('../data/index.js', () => ({
    readData: jest.fn().mockResolvedValue([{id: 'test-id', firstname: 'Test', lastname: 'Test lastname'}]),
    writeData: jest.fn((data) => data),
}));

describe('Server', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it(`Should use the GraphQl API middleware on ${GRAPH_ENDPOINT} endpoint`, async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `
                    {
                        users {
                            id
                            firstname
                        }
                    }
                `
            });

        expect(response.statusCode).toBe(200);
        expect(response.body?.data?.users).toBeDefined();
    });

    it.each([
        'pages',
        'users',
    ])('Should read %p json data when requests API', async (name) => {
        const mockReadData = jest.fn().mockResolvedValue([])
        jest.spyOn(data, 'readData').mockImplementation(mockReadData)

        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `
                    {
                        ${name} {
                            id
                        }
                    }
                `
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data[name]).toBeDefined();

        expect(mockReadData).toHaveBeenCalledWith(name);
    });
});
