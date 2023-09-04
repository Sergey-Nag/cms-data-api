const { GraphQLString, GraphQLList, GraphQLBoolean } = require('graphql');
const { UserType, UserPermissionsInput } = require('./type');
const { getUserResolve, getAllUsersResolve } = require('./resolvers');
const DataService = require('../../services/DataService/DataService');
const { UserRepository } = require('../../data/repositories');
const ValidationService = require('../../services/ValidationService');
const UserValidator = require('../../data/validators/UserValidator');

const queryFields = {
    id: { type: GraphQLString },
    actionUserId: { type: GraphQLString },
    firstname: { type: GraphQLString },
    lastname: { type: GraphQLString },
    email: { type: GraphQLString },
    permissions: { type: UserPermissionsInput },
    isOnline: { type: GraphQLBoolean },
    createdISO: { type: GraphQLString },
    lastModifiedISO: { type: GraphQLString },
    createdById: { type: GraphQLString },
}


/** @type {import('graphql/type/definition').GraphQLFieldConfigMap} */
module.exports = {
    users: {
        type: GraphQLList(UserType),
        args: queryFields,
        resolve: async (parent, { actionUserId, ...queryFields }) => {
            // const userValidator = new UserValidator();
            // userValidator.validateRequest(queryFields, actionUserId);

            const usersService = new DataService(new UserRepository());
            const response = await usersService.getAll(queryFields);

            // userValidator.validateResponse(response);

            return response;
        }
        // resolve: getAllUsersResolve,
    },
    user: {
        type: UserType,
        args: queryFields,
        resolve: getUserResolve,
    }
};
