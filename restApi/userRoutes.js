const express = require('express');
const UserAuthenticationService = require('../services/UserAuthenticationService');
const SessionManager = require('../managers/SessionManager');
const {authenticateRequiredMiddleware, authenticateMiddleware, accessTokenOnlyMiddleware} = require('../middlewares/authenticateMiddleware');
const ApiErrorFactory = require('../utils/ApiErrorFactory');
const ApiSuccessFactory = require('../utils/ApiSuccessFactory');
const { UserRepository, UserCredentialsRepository } = require('../data/repositories');
const { ADMIN_ID } = require('../constants/env');
const router = express.Router();

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Authenticate a user
 *     tags:
 *       - Authentication
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 password:
 *                   type: string
 *     responses:
 *       '200':
 *         description: Successful response
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/login', async (req, res) => {
    try {
        if (!req.body) {
            throw ApiErrorFactory.dataNotProvided();
        }
        
        const { email, password } = req.body;

        const user = await UserAuthenticationService.authenticateUser(
            email,
            password
        );
        
        const sessions = new SessionManager();
        const tokens = sessions.createSession(user.id);

        res.status(200).json(tokens);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});


/**
 * @openapi
 * /logout:
 *   post:
 *     security:
 *        - BearerAuth: []
 *     summary: Logout a user
 *     tags:
 *       - Authentication
 *     responses:
 *       '200':
 *         description: Logged out successfully
 *       '401':
 *         description: Unauthorized
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *         example:
 *           error: Unauthorized logout
 * components:
 *  securitySchemes:
 *     BearerAuth:
 *      type: http
 *      scheme: bearer
 */
router.post('/logout', [authenticateRequiredMiddleware, accessTokenOnlyMiddleware], async (req, res) => {
    try {
        const userId = req.userId;
        await UserAuthenticationService.logoutUser(userId);
        const sessions = new SessionManager();
        if (!sessions.getSession(userId)) {
            throw ApiErrorFactory.unauthorized();
        }

        sessions.endSession(userId);

        res.status(200).json({ message: ApiSuccessFactory.loggerOut() });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});


/**
 * @openapi
 * /change-password:
 *   post:
 *     summary: Change password for a user
 *     tags:
 *       - Authentication
 *     security:
 *        - BearerAuth: []
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 newPassword:
 *                   type: string
 *     responses:
 *       '200':
 *         description: Successfuly changed
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
router.post('/change-password', [authenticateRequiredMiddleware, accessTokenOnlyMiddleware, (req, res, next) => {
    try {        
        if (!req.userId) {
            throw ApiErrorFactory.unauthorized();
        }

        const sessions = new SessionManager();
        const session = sessions.getSession(req.userId);

        if (!session) {
            throw ApiErrorFactory.unauthorized();
        }
    } catch(e) {
        return res.status(401).json({ error: e.message });
    }
    next();
}], async (req, res) => {
    try {
        const userId = req.userId;

        if (!req.body?.newPassword) {
            throw ApiErrorFactory.dataNotProvided();
        }

        const isUpdated = await UserAuthenticationService.updatePassword(userId, req.body?.newPassword);

        if (!isUpdated) {
            throw ApiErrorFactory.somethingWentWrong();
        }
    
        res.status(200).json({ message: ApiSuccessFactory.passwordUpdated() });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

if (process.env.NODE_ENV !== 'production') {
    
/**
 * @openapi
 * /quick-login-admin:
 *   post:
 *     summary: Authenticate a user
 *     tags:
 *       - Authentication
 *     responses:
 *       '200':
 *         description: Returns user and tokens
 *       '401':
 *         description: Unauthorized
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *         example:
 *           error: Authentication failed
 */
    router.post('/quick-login-admin', async (req, res) => {
        try {
            const usersRepo = new UserRepository();
            const usersCred = new UserCredentialsRepository();
            await usersRepo.load();
            await usersCred.load();

            const { email, id } = usersRepo.get({ id: ADMIN_ID });
            const {__TEST__password} = usersCred.get({ id });

            const user = await UserAuthenticationService.authenticateUser(
                email,
                __TEST__password
            );
            
            const sessions = new SessionManager();
            const tokens = sessions.createSession(user.id);

            res.status(200).json({user, tokens});
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    });
} 


module.exports = router;