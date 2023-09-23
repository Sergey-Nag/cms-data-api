const SessionManager = require("../../managers/SessionManager");

const externalMatchProperties = new Map();

externalMatchProperties.set('isOnline', (item) => {
    const session = new SessionManager();

    return !!session.getSession(item.id);
});

module.exports = externalMatchProperties;