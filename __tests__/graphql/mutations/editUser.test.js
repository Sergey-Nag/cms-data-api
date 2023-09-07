const mockUsers = require('../../__mocks__/users.json');
const mockPages = require('../../__mocks__/pages.json');
const data = require('../../../data/index.js');
const server = require('../../../index');
const uniqid = require('uniqid');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');
const { expectUserData } = require('../utils');
const { merge } = require('lodash');

jest.mock('uniqid');
jest.mock('../../../data/index.js', () => ({
    readData: jest.fn().mockImplementation((name) => {
        if (name === 'users') {
            return Promise.resolve(mockUsers);
        } else if (name === 'pages') {
            return Promise.resolve(mockPages);
        }
    }),
    writeData: jest.fn(),
}));

const MOCK_ISO_TIME = '2023-09-02T19:30:36.258Z'
Date.prototype.toISOString = jest.fn(() => MOCK_ISO_TIME);

describe('editUser mutation', () => {
    const mockWriteDataFn = jest.fn();
    const MOCK_UNIQID = 'Pageuniqid';
    uniqid.mockReturnValue(MOCK_UNIQID);
    jest.spyOn(data, 'writeData').mockImplementation(mockWriteDataFn);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Should update a user data by user that has access and return it', async () => {
        const updateData = {
            firstname: 'new test name',
            lastname: 'new last name',
            email: 'new@email.com',
            isOnline: true,
            permissions: {
                canSee: {
                    analytics: true,
                    products: true,
                    orders: true,
                    pages: true,
                    users: true,
                }
            }
        }
        const oldUser = {...mockUsers[2]};

        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                variables: {
                    data: updateData,
                },
                query: `mutation EDIT($data: EditUserInput!) {
                    editUser(
                        id: "${mockUsers[2].id}"
                        actionUserId: "${mockUsers[0].id}"
                        data: $data
                    ) {
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
                                users
                            }
                            canEdit {
                                analytics
                                products
                                orders
                                pages
                                users
                            }
                            canDelete {
                                analytics
                                products
                                orders
                                pages
                                users
                            }
                        }
                        createdBy {
                            id
                        }
                    }
                }`
            });

        
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.editUser).toBeDefined();

        expectUserData(response.body.data.editUser, {
            ...updateData,
            lastModifiedISO: MOCK_ISO_TIME,
        }, oldUser);
        
        merge(updateData, mockUsers[2]);
        expect(mockUsers).toContainEqual(updateData);
        expect(mockWriteDataFn).toHaveBeenCalledWith('users', mockUsers);
    });

    it.each([
        [
            'Should get Action forbidden error when action user has no access', 
            {
                id: mockUsers[2].id, 
                actionUserId: mockUsers[1].id
            },
            ApiErrorFactory.actionForbidden(),
        ],
        [
            'Should get User not found error when id is wrong', 
            {
                id: 'not-existed-user-id', 
                actionUserId: mockUsers[0].id
            },
            ApiErrorFactory.userNotFound(),
        ],
        [
            'Should get Something went wrong error when id is empty', 
            {
                id: '', 
                actionUserId: mockUsers[0].id
            },
            ApiErrorFactory.somethingWentWrong(),
        ],
        [
            'Should get User not found error when actionUserId is wrong', 
            {
                id: mockUsers[2].id, 
                actionUserId: 'not-existed-user-id'
            },
            ApiErrorFactory.userNotFound(),
        ],
    ])('%s', async (_, variables, error) => {
        const updateData = {
            firstname: 'new test name',
            lastname: 'new last name',
            email: 'new@email.com',
            isOnline: true,
            permissions: {
                canSee: {
                    analytics: true,
                    products: true,
                    orders: true,
                    pages: true,
                    users: true,
                }
            }
        }
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                variables: {
                    data: updateData,
                    ...variables,
                },  
                query: `mutation EDIT($data: EditUserInput! $id: String! $actionUserId: String!) {
                    editUser(
                        id: $id
                        actionUserId: $actionUserId
                        data: $data
                    ) {
                        id
                        lastname
                    }
                }`
            });

        expect(response.body.data.editUser).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(error.message);

        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });

    it.each([
        [
            ['firstname'], ['new first name'],
        ],
        [
            ['lastname'], ['new last name'],
        ],
        [
            ['email'], ['new-awesome@mail.cc'],
        ],
        [
            ['isOnline'], [ false ],
        ],
        [
            ['permissions'], [{ canSee: { pages: true, users: false } }],
        ],
        [
            ['firstname', 'permissions'],
            ['Adam', { canSee: {analytics: true}, canEdit: { analytics: true }, canDelete: { analytics: true }}],
        ],
        [
            ['lastname', 'email', 'isOnline'],
            ['Supfursdnvasdvonacvadfvoin', 'sdffffffff@dfadf.cdc', false],
        ]
    ])('Should update only provided properties: %s', async (props, values) => {
        const updateData = props.reduce((acc, prop, i) => {
            acc[prop] = values[i];
            return acc;
        }, {});
        const oldUser = {...mockUsers[2]};
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                variables: {
                    data: updateData,
                },  
                query: `mutation EDIT($data: EditUserInput!) {
                    editUser(
                        id: "${mockUsers[2].id}"
                        actionUserId: "${mockUsers[0].id}"
                        data: $data
                    ) {
                        id
                        firstname
                        lastname
                        email
                        isOnline
                        permissions {
                            canSee {
                                analytics
                                products
                                orders
                                pages
                                users
                            }
                            canEdit {
                                analytics
                                products
                                orders
                                pages
                                users
                            }
                            canDelete {
                                analytics
                                products
                                orders
                                pages
                                users
                            }
                        }
                    }
                }`
            });
        
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.editUser).toBeDefined();

        Object.keys(response.body.data.editUser).forEach((prop) => {
            if (props.includes(prop)) {
                if (prop === 'permissions') {
                    expectUserData(response.body.data.editUser, { permissions: updateData.permissions }, { permissions: oldUser.permissions});
                } else {
                    expect(response.body.data.editUser).toHaveProperty(prop, updateData[prop]);
                }
            } else {
                expect(response.body.data.editUser).toHaveProperty(prop, mockUsers[2][prop]);
            }
        });
    });

    it.each([
        [
            ['firstname'], [''], ApiErrorFactory.userFirstnameInvalid(),
        ],
        [
            ['firstname'], [' 1 '], ApiErrorFactory.userFirstnameInvalid(),
        ],
        [
            ['email'], [''], ApiErrorFactory.userEmailInvalid(),
        ],
        [
            ['email'], ['ho ho'], ApiErrorFactory.userEmailInvalid(),
        ],
        [
            ['email'], ['abta@.ss'], ApiErrorFactory.userEmailInvalid(),
        ],
        [
            ['firstname', 'email'], ['-', 'abta@.ss'], ApiErrorFactory.userFirstnameInvalid(),
        ],
        [
            ['firstname', 'email'], ['lolo', 'abta@.ss'], ApiErrorFactory.userEmailInvalid(),
        ],
    ])('Should get validation error for ivalid props: %s', async (props, values, error) => {
        const updateData = props.reduce((acc, prop, i) => {
            acc[prop] = values[i];
            return acc;
        }, {});
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                variables: {
                    data: updateData,
                },
                query: `mutation EDIT($data: EditUserInput!) {
                    editUser(
                        id: "${mockUsers[2].id}"
                        actionUserId: "${mockUsers[0].id}"
                        data: $data
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.data.editUser).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(error.message);

        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });
});
