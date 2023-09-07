const SessionManager = require("../managers/SessionManager");
const ApiErrorFactory = require("../utils/ApiErrorFactory");

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

function authenticateNotExpiredTokenMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            const usersSession = new SessionManager();

            const decodedUserData = usersSession.verifyAccessToken(token);
            if (usersSession.isTokenExpired(decodedUserData)) {
                return res.status(401).json({ error: ApiErrorFactory.tokenExpired().message })
            }
            req.userId = decodedUserData?.userId ?? null;
        } catch (error) {
            // Token verification failed
            console.log(error);
            req.userId = null;
        }
    }
    next();
}
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
