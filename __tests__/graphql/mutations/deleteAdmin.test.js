const mockAdmins = require('../../__mocks__/admins.json');
const mockPages = require('../../__mocks__/pages.json');
const data = require('../../../data/index.js');
const server = require('../../../index');
const uniqid = require('uniqid');
const supertest = require('supertest');
const ApiErrorFactory = require('../../../utils/ApiErrorFactory');
const { GRAPH_ENDPOINT } = require('../../constants');
const { expectUserData } = require('../utils');
const SessionManager = require('../../../managers/SessionManager');
const { USER_CREDS_REPO_NAME, PAGES_REPO_NAME, ADMINS_REPO_NAME } = require('../../../constants/repositoryNames');
const mockAdminsRepoName = ADMINS_REPO_NAME;
const mockPagesRepoName = PAGES_REPO_NAME;

jest.mock('uniqid');
jest.mock('../../../data/index.js', () => ({
    readData: jest.fn().mockImplementation((name) => {
        if (name === mockAdminsRepoName) {
            return Promise.resolve(mockAdmins);
        } else if (name === mockPagesRepoName) {
            return Promise.resolve(mockPages);
        }
    }),
    writeData: jest.fn(),
}));

describe('Delete entity mutation (deleteAdmin)', () => {
    const mockWriteDataFn = jest.fn();
    const MOCK_UNIQID = 'Pageuniqid';
    uniqid.mockReturnValue(MOCK_UNIQID);
    jest.spyOn(data, 'writeData').mockImplementation(mockWriteDataFn);

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

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Should get unauthorized error if requests without Auth header', async () => {
        const deleteUser = {...mockAdmins.at(-1)};
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .send({
                query: `mutation {
                    deleteAdmins(
                        ids: "${deleteUser.id}"
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.errors[0].message).toBe(ApiErrorFactory.unauthorized().message);
        expect(response.body.data.deleteAdmins).toBeNull();
    });

    it('Should delete user and credentials by user that has access and return it', async () => {
        const deleteUser = {...mockAdmins.at(-1)};
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `mutation {
                    deleteAdmins(
                        ids: ["${deleteUser.id}"]
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
                                admins
                                customers
                            }
                            canEdit {
                                analytics
                                products
                                orders
                                pages
                                admins
                                customers
                            }
                            canDelete {
                                analytics
                                products
                                orders
                                pages
                                admins
                                customers
                            }
                        }
                        createdBy {
                            id
                        }
                    }
                }`
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.deleteAdmins).toBeDefined();

        expectUserData(response.body.data.deleteAdmins[0], deleteUser);
        expect(mockAdmins).not.toContainEqual(
            expect.objectContaining({
                id: deleteUser.id
            })
        );
        expect(mockWriteDataFn).toHaveBeenCalledWith(ADMINS_REPO_NAME, mockAdmins);
    });
    
    it('Should get Action forbidden error when action user has no access', async () => {
        const notDeletedUser = {...mockAdmins.at(-1)};
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithoutAccessToken}`)
            .send({
                query: `mutation {
                    deleteAdmins(
                        ids: ["${notDeletedUser.id}"]
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.data.deleteAdmins).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.actionForbidden().message);
        
        expect(mockAdmins).toContainEqual(notDeletedUser);
        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });

    it('Should get User not found error with wrong id', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer ${userWithAccessToken}`)
            .send({
                query: `mutation {
                    deleteAdmins(
                        ids: ["not-existed-user-id"]
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.data.deleteAdmins).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.userNotFound().message);
        
        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });

    it('Should get unauthorized error with not existed token', async () => {
        const response = await supertest(server).post(GRAPH_ENDPOINT)
            .set('Authorization', `Bearer some-not-existed-token`)
            .send({
                query: `mutation {
                    deleteAdmins(
                        ids: ["${mockAdmins[2].id}"]
                    ) {
                        id
                    }
                }`
            });

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(ApiErrorFactory.unauthorized().message);
        expect(response.body.data?.deleteAdmins).toBeUndefined();
        
        expect(mockWriteDataFn).not.toHaveBeenCalled();
    });
});
