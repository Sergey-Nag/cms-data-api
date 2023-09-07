const { GraphQLString, GraphQLList, GraphQLBoolean } = require('graphql');
const { UserType, UserPermissionsInput } = require('./type');
const UsersResolver = require('./UsersResolver');

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
const users = {
    type: GraphQLList(UserType),
    args: queryFields,
    resolve: UsersResolver.getAll,
};
const user = {
    type: UserType,
    args: queryFields,
    resolve: UsersResolver.get,
};

module.exports = {
    users,
    user
}