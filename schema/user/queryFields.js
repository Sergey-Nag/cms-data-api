const { GraphQLString, GraphQLList, GraphQLBoolean } = require('graphql');
const { UserType, UserPermissionsInput } = require('./type');
const UserResolver = require('./UsersResolver');
const { authProtect } = require('../utils');

const queryFields = {
    id: { type: GraphQLString },
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
        resolve: authProtect(UserResolver.getAll)
    },
    user: {
        type: UserType,
        args: queryFields,
        resolve: authProtect(UserResolver.get),
    }
};
