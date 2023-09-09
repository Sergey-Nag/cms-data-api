const express = require('express');
const UserAuthenticationService = require('../services/UserAuthenticationService');
const SessionManager = require('../managers/SessionManager');
const {authenticateRequiredMiddleware, authenticateMiddleware} = require('../middlewares/authenticateMiddleware');
const ApiErrorFactory = require('../utils/ApiErrorFactory');
const ApiSuccessFactory = require('../utils/ApiSuccessFactory');
const { UserRepository, UserCredentialsRepository } = require('../data/repositories');
const router = express.Router();


/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticate a user
 *     tags:
 *       - Authentication
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: credentials
 *         description: User login credentials
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: Authorized
 *         schema:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *             refreshToken:
 *               type: string
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *         example:
 *           error: Authentication failed
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Call the authentication service to verify user credentials
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
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout a user
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *         example:
 *           error: Unauthorized logout
 */
router.post('/logout', [authenticateRequiredMiddleware, authenticateMiddleware], async (req, res) => {
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

if (process.env.NODE_ENV !== 'production') {
    
/**
 * @swagger
 * /quick-login-first-user:
 *   post:
 *     summary: TEST Authenticate a first user and return its data with tokens
 *     tags:
 *       - Authentication
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns user and tokens
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *         example:
 *           error: Authentication failed
 */
    router.post('/quick-login-first-user', async (req, res) => {
        try {
            const usersRepo = new UserRepository();
            const usersCred = new UserCredentialsRepository();
            await usersRepo.load();
            await usersCred.load();

            const { email, id } = usersRepo.data[0];
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