const { GraphQLString, GraphQLNonNull, GraphQLList, GraphQLInputObjectType, GraphQLBoolean } = require('graphql');
const { UserType, AdminPagesRights, UserPermissionsInput } = require('./type');
const UsersResolver = require('./UsersResolver');

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
const addUser = {
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
    resolve: UsersResolver.add
};
const editUser = {
    type: UserType,
    args: {
        id: { type: GraphQLNonNull(GraphQLString) },
        actionUserId: { type: GraphQLString },
        data: {
            type: GraphQLNonNull(EditUserInput),
            args: userEditFields,
        },
    },
    resolve: UsersResolver.edit,
};
const deleteUser = {
    type: UserType,
    args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        actionUserId: { type: GraphQLString },
    },
    resolve: UsersResolver.delete,
};

module.exports = {
    addUser,
    editUser,
    deleteUser,
}