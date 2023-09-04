const { GraphQLString, GraphQLNonNull,GraphQLList, GraphQLInputObjectType, GraphQLBoolean } = require('graphql');
const { UserType, AdminPagesRights, UserPermissionsInput } = require('./type');
const { addUserResolve, editUserResolve, deleteUserResolve } = require('./resolvers');
const UserRepository = require('../../data/repositories/UserRepository');

const userEditFields = {
    firstname: { type: GraphQLString },
    lastname: { type: GraphQLString },
    email: { type: GraphQLString },
    isOnline: { type: GraphQLBoolean },
    permissions: { type: UserPermissionsInput },
}

const EditUserInput = new GraphQLInputObjectType({
    name: 'EditUserInput',
    fields: userEditFields,
});

/** @type {import('graphql/type/definition').GraphQLFieldConfigMap} */
module.exports = {
    addUser: {
        type: UserType,
        args: {
            firstname: { type: GraphQLNonNull(GraphQLString) },
            email: { type: GraphQLNonNull(GraphQLString) },
            lastname: { type: GraphQLString },
            permissions: {
                type: UserPermissionsInput,
                args: {
                    canSee: { type: AdminPagesRights },
                    canEdit: { type: AdminPagesRights },
                    canDelete: { type: AdminPagesRights },
                },
            },
            actionUserId: { type: GraphQLString },
        },
        resolve: addUserResolve,
    },
    editUser: {
        type: UserType,
        args: {
            id: { type: GraphQLNonNull(GraphQLString) },
            actionUserId: { type: GraphQLString },
            data: {
                type: GraphQLNonNull(EditUserInput),
                args: userEditFields,
            },
        },
        resolve: editUserResolve,
    },
    deleteUser: {
        type: UserType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) },
            actionUserId: { type: GraphQLString },
        },
        resolve: deleteUserResolve,
    }
}
