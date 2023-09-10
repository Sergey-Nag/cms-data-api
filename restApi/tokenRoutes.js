const express = require('express');
const ApiErrorFactory = require('../utils/ApiErrorFactory');
const { TokenManager } = require('../managers/TokenManager');
const SessionManager = require('../managers/SessionManager');
const { authenticateRequiredMiddleware, authenticateMiddleware } = require('../middlewares/authenticateMiddleware');
const router = express.Router();
/**
 * @openapi
 * /refresh-token:
 *   post:
 *     security:
 *        - BearerAuth: []
 *     summary: Refresh Access Token
 *     description: |
 *       This endpoint allows users to refresh their access tokens using a valid refresh token.
 *       If a valid refresh token is provided, a new access token will be generated and returned.
 *     tags:
 *       - Token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful response
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 * components:
 *  securitySchemes:
 *     BearerAuth:
 *      type: http
 *      scheme: bearer
 */

router.post('/refresh-token', [authenticateRequiredMiddleware, authenticateMiddleware], (req, res) => {
    const { refreshToken } = req.body;
    try {
        const tokenManager = new TokenManager();
        const userId = req.userId;

        if (!userId) {
            throw ApiErrorFactory.tokenInvalid();
        }

        const decodedToken = tokenManager.verifyRefreshToken(refreshToken);
        const sessions = new SessionManager();

        if (
            !decodedToken?.userId ||
            !sessions.getSession(decodedToken.userId) ||
            tokenManager.isTokenExpired(decodedToken)
        ) {
            throw ApiErrorFactory.unauthorized();
        }

        const { accessToken } = sessions.refreshSession(userId);

        res.status(200).json({accessToken})
    } catch (e) {
        res.status(401).json({ error: e.message });
    }

});

module.exports = router;