const express = require('express');
const ApiErrorFactory = require('../utils/ApiErrorFactory');
const router = express.Router();

/**
 * @swagger
 *   /refresh-token:
 *     post:
 *       summary: Refresh Access Token
 *       description: |
 *         This endpoint allows users to refresh their access tokens using a valid refresh token.
 *         If a valid refresh token is provided, a new access token will be generated and returned.
 *       tags:
 *         - Authentication
 *       consumes:
 *         - application/json
 *       parameters:
 *         - in: body
 *           name: token
 *           description: Refresh token
 *           required: true
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *       responses:
 *         200:
 *           description: Successfully refreshed access token
 *           schema:
 *             type: object
 *             properties:
 *               accessToken:
 *                 type: string
 *         400:
 *           description: Bad Request
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 description: Invalid refresh token
 *         401:
 *           description: Unauthorized
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 description: Refresh token has expired
 */
router.post('/refresh-token', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: ApiErrorFactory.tokenInvalid().message });
    }

    // const usersSession = UserSessionService.getInstance();
    // Verify the refresh token and find the associated user
    // const userId = usersSession.verifyUserByRefreshToken(refreshToken)

    // if (!userId) {
    //     return res.status(401).json({ error: 'Refresh token has expired' });
    // }

    // Generate a new access token and return it to the client
    // const newAccessToken = usersSession.refreshUserAccessToken(userId);
    res.json({ accessToken: null });
});

module.exports = router;