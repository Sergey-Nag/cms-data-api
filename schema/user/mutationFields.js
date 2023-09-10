const { GraphQLString, GraphQLNonNull,GraphQLList, GraphQLInputObjectType, GraphQLBoolean } = require('graphql');
const { UserType, AdminPagesRights, UserPermissionsInput } = require('./type');
const UserResolver = require('./UsersResolver');
const { authProtect } = require('../utils');
const { addUserProtect, editUserProtect } = require('./mutationProtections');

const userEditableFields = {
    firstname: { type: GraphQLString },
    lastname: { type: GraphQLString },
    email: { type: GraphQLString },
    permissions: { type: UserPermissionsInput },
}

const EditUserInput = new GraphQLInputObjectType({
    name: 'EditUserInput',
    fields: userEditableFields,
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
        },
        resolve: authProtect(addUserProtect(UserResolver.add)),
    },
    editUser: {
        type: UserType,
        args: {
            id: { type: GraphQLNonNull(GraphQLString) },
            data: {
                type: GraphQLNonNull(EditUserInput),
                args: userEditableFields,
            },
        },
        resolve: authProtect(editUserProtect(UserResolver.edit)),
    },
    deleteUser: {
        type: UserType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: authProtect(UserResolver.delete),
    }
}
