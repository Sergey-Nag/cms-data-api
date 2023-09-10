const UserRegistrationService = require("../services/UserRegistrationService");

async function setup() {
    const isAdminExist = await UserRegistrationService.isAdminUserExist();

    if(!isAdminExist) {
        await UserRegistrationService.createAdminUser();
    }
}

module.exports = {
    setup,
}