const kebabCase = require("lodash/kebabCase");

module.exports = class ApiErrorFactory {
    static pageNotFound(id = null) {
        return new Error(
            id ? `Page with id "${id}" not found` : 'Page not found'
        );
    }
    static userNotFound() {
        return new Error('User not found');
    }
    static permissionsNotFound(username = null) {
        return new Error(`No permissions found${username ? ` for ${username}` : ''}`);
    }
    static actionForbidden() {
        return new Error(`Action is forbidden`);
    }
    static somethingWentWrong() {
        return new Error('Something went wrong! Double-check your request and try again.');
    }
    static pageAliasInvalid(alias) {
        return new Error(`Page alias${!!alias ? ` "${alias}"` : ''} is invalid! It should be in kebabCase${!!alias && kebabCase(alias) !== alias ? `, like this "${kebabCase(alias)}"` : ''}.`);
    }
    static pagePathIsEmpty() {
        return new Error('Page path shouln\'t be empty! At least on item is required.');
    }
    static pagePathIsNotValid() {
        return new Error('Page path is invalid! All of the items should be in kebabCase');
    }
    static pageTitleToShort() {
        return new Error('Page title is to short! At least 2 characters are required.');
    }
    static userFirstnameInvalid() {
        return new Error('First name must not be empty and must have at least 2 characters.');
    }
    static userEmailInvalid() {
        return new Error('Invalid email format!');
    }
    static userPasswordInvalid() {
        return new Error('Pasword is to short!');
    }
    static tokenInvalid(message) {
        return new Error(`Invalid token!${message ? ' '+message : ''}`);
    }
    static tokenExpired() {
        return new Error('Token has expired!');
    }
    static userCredentialsInvalid() {
        return new Error('Invalid email or password');
    }
    static authorizationTokenWasntProvided(){
        return new Error('Authorization token has not been provided!');
    }
    static unauthorized(){
        return new Error('Unauthorized!');
    }
}