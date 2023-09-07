const bcrypt = require('bcrypt');
const RepositoryService = require("./RepositoryService");
const ApiValidationErrors = require('../ApiValidationErrors');

module.exports = class UserAuthenticationService {
    static async authenticateUser(email, password) {
        // Validate user input (e.g., check email format)
        // Implement your validation logic here, similar to UserRegistrationService

        // Load user credentials and user data from repositories
        const credentialsRepo = new RepositoryService('credentials');
        const userRepo = new RepositoryService('users');

        await credentialsRepo.load();
        await userRepo.load();

        // Find the user's credentials based on their email
        const user = userRepo.get({ email });

        // If no user credentials found, return null to indicate failed authentication
        if (!user) {
            throw ApiValidationErrors.userAuthCredentialsWrong();
        }

        const userCredentials = credentialsRepo.get({ userId: user.id });

        if (!userCredentials) {
            throw ApiValidationErrors.somethingWentWrong();
        }

        // Verify the provided password against the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, userCredentials.hashedPassword);

        if (!isPasswordValid) {
            throw ApiValidationErrors.userAuthCredentialsWrong();
        }

        // If the password is valid, find the user data associated with the credentials
        // Return the user data to indicate successful authentication
        return user;
    }
}