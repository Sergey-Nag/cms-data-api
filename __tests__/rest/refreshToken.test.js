const supertest = require('supertest');
const server = require('../../index.js');
const mockUsers = require('../__mocks__/users.json');
const ApiErrorFactory = require("../../utils/ApiErrorFactory");
const { REST_ENDPOINT } = require('../constants');
const SessionManager = require('../../managers/SessionManager');
const jwt = require('jsonwebtoken');
const { SECRET_REFRESH_TOKEN, SECRET_ACCESS_TOKEN } = require('../../constants/env');

const refreshEndpoint = `${REST_ENDPOINT}/refresh-token`;

describe('Refresh token', () => {
    const expiredRefreshToken = jwt.sign({ userId: mockUsers[0].id}, SECRET_REFRESH_TOKEN, { expiresIn: '0s' });
    const notUserRefreshToken = jwt.sign({some: 'data'}, SECRET_REFRESH_TOKEN, { expiresIn: '1m' });
    const nonexistendUserRefreshToken = jwt.sign({ userId: 'not-existed-user-id' }, SECRET_REFRESH_TOKEN, { expiresIn: '1m' });

    let session;
    beforeEach(() => {
        const sessions = new SessionManager();
        session = sessions.createSession(mockUsers[0].id);
    });
    afterEach(() => {
        const sessions = new SessionManager();
        sessions.endSession(mockUsers[0].id);
    });

    it('Should get Token has not been provided error when request without Auth header', async() => {
        const response = await supertest(server).post(refreshEndpoint)
            .send({
                refreshToken: session.refreshToken,
            })
            .expect(401);

        expect(response.body.error).toBe(ApiErrorFactory.authorizationTokenWasntProvided().message);
    });
    
    it.each([
        [ 'invalid', 'asdasdf2341'],
        [ 'does not contain user id',  notUserRefreshToken ],
        [ 'belong to nonexistent user', nonexistendUserRefreshToken ],
    ])('Should get Token invalid error when access token %s', async(_, accessToken) => {
        const response = await supertest(server).post(refreshEndpoint)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                refreshToken: session.refreshToken,
            })
            .expect(401);

        expect(response.body.error).toBe(ApiErrorFactory.tokenInvalid().message);
    });

    it.each([
        [ 'empty', '' ],
        [ 'invalid', 'asdf' ],
        [ 'expired', expiredRefreshToken ],
        [ 'does not contain user id', notUserRefreshToken ],
        [ 'contains nonexistend user', nonexistendUserRefreshToken ],
    ])('Should get Unauthorized error when refresh token %s', async(_, refreshToken) => {
        const response = await supertest(server).post(refreshEndpoint)
            .set('Authorization', `Bearer ${session.accessToken}`)
            .send({
                refreshToken,
            })
            .expect(401);

        expect(response.body.error).toBe(ApiErrorFactory.unauthorized().message);
    });

    it('Should not get error on access token expired then update session and return new access token', async () => {
        const expiredAccessToken = jwt.sign({ userId: mockUsers[0].id}, SECRET_ACCESS_TOKEN, { expiresIn: '0s' });
        const oldAccessToken = expiredAccessToken;
        const oldRefreshToken = session.refreshToken;
        const response = await supertest(server).post(refreshEndpoint)
            .set('Authorization', `Bearer ${oldAccessToken}`)
            .send({
                refreshToken: session.refreshToken,
            })
            .expect(200);

        expect(response.body.error).toBeUndefined();
        expect(response.body.accessToken).not.toBe(oldAccessToken);
        expect(session.accessToken).not.toBe(oldAccessToken);
        expect(session.refreshToken).toBe(oldRefreshToken);
    });


    it('Should get same access token if its not expired yet when refresh token is valid', async () => {
        const oldAccessToken = session.accessToken;
        const response = await supertest(server).post(refreshEndpoint)
            .set('Authorization', `Bearer ${oldAccessToken}`)
            .send({
                refreshToken: session.refreshToken,
            })
            .expect(200);

        expect(response.body.error).toBeUndefined();
        expect(response.body.accessToken).toBe(oldAccessToken);
        expect(session.accessToken).toBe(oldAccessToken);
    });

    it('Should get update access token if issued time has changed when refresh token is valid', async () => {
        const oldAccessToken = session.accessToken;
        const originSign = jwt.sign;
        jest.spyOn(jwt, 'sign').mockImplementation((payload, sectedKey, options) => {
            const customIat = Math.floor((Date.now() / 1000) + 100)
            return originSign({
                ...payload,
                iat: customIat,
            }, sectedKey, options);
        });

        const response = await supertest(server).post(refreshEndpoint)
            .set('Authorization', `Bearer ${oldAccessToken}`)
            .send({
                refreshToken: session.refreshToken,
            })
            .expect(200);

        
        expect(response.body.error).toBeUndefined();
        expect(response.body.accessToken).not.toBe(oldAccessToken);
        session = new SessionManager().getSession(mockUsers[0].id);

        expect(session.accessToken).toBe(response.body.accessToken);
    });
});