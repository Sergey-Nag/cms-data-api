const UserSessionService = require('../services/UserSessionService');

module.exports = function authUserMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            const usersSession = UserSessionService.getInstance();

            req.userId = usersSession.verifyUserByAccessToken(token);

            if (req.userId === null) {
                res.send(401);
            }
        } catch (error) {
            // Token verification failed
            console.log(error);
            req.userId = null;

        }
    }

    next();
};