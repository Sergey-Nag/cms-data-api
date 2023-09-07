const express = require('express');
const UserRegistrationService = require('../services/UserRegistrationService');
const UserAuthenticationService = require('../services/UserAuthenticationService');
const UserSessionService = require('../services/UserSessionService');
const router = express.Router();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - User
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user
 *         description: User registration data
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             firstname:
 *               type: string
 *             lastname:
 *               type: string
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *         example:
 *           error: Invalid email address
 */
router.post('/register', async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

            await UserRegistrationService.registerUser(
                firstname,
                lastname,
                email,
                password
            );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

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

        const tokens = UserSessionService.getInstance().login(user);

        res.status(200).json(tokens);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

module.exports = router;
