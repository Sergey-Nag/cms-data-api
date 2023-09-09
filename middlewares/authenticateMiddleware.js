const { UserRepository } = require("../data/repositories");
const SessionManager = require("../managers/SessionManager");
const ApiErrorFactory = require("../utils/ApiErrorFactory");

/**
 * If token exists or doesn't or invalid should NOT return an error.
 */
function authenticateMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            const usersSession = new SessionManager();

            const userData = usersSession.verifyAccessToken(token);
            req.userId = userData?.userId ?? null;
        } catch (error) {
            // Token verification failed
            // console.log(error);
            req.userId = null;
        }
    }

    next();
};

/**
 * If token exists and it's expired should return 401 an error.
 */
async function authenticateNotExpiredTokenMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            const usersSession = new SessionManager();
            const decodedUserData = usersSession.verifyAccessToken(token);

            if (!usersSession.getSession(decodedUserData.userId)) {
                throw ApiErrorFactory.tokenObsolete();
            }

            if (usersSession.isTokenExpired(decodedUserData)) {
                throw ApiErrorFactory.tokenExpired();
            }

            const usersRepo = new UserRepository();
            await usersRepo.load();
            
            const user = usersRepo.get({ id: decodedUserData?.userId });

            req.user = user;
        } catch (error) {
            // Token verification failed
            console.log(error);
            return res.status(401).json({ errors: [{message: error.message}] })
        }
    }
    next();
}
/**
 * If token doesn't exist should return 401 an error.
 */
function authenticateRequiredMiddleware(req, res, next) {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: ApiErrorFactory.authorizationTokenWasntProvided().message });
    }
    next();
}

module.exports = {
    authenticateMiddleware,
    authenticateRequiredMiddleware,
    authenticateNotExpiredTokenMiddleware
}
