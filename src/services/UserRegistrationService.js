const bcrypt = require('bcrypt');
const UserCredentials = require('../models/UserCredentials');
const UserValidator = require('../validators/UserValidator');
const RepositoryService = require('./RepositoryService');
const UsersRepository = require('../repositories/UsersRepository');

module.exports = class UserRegistrationService {
    static async registerUser(firstname, lastname, email, password) {
        const userRepo = new UsersRepository();
        const credentialsRepo = new RepositoryService('credentials');
        
        await credentialsRepo.load();
        await userRepo.load();

        const userValidator = new UserValidator(userRepo);
        userValidator.validate(firstname, email, password);

        // Hash the password (replace 'saltRounds' with the desired number)
        const saltRounds = firstname.length;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
    
        // Create a new user instance
        const newUser = userRepo.add({firstname, lastname, email});
        const newUserCredentials = UserCredentials.create(newUser.id, hashedPassword);

        credentialsRepo.add(newUserCredentials);

        // Save the user to the database (you can use an ORM or database client here)
        await userRepo.save();
        await credentialsRepo.save();
    }
}