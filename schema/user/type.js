const { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLEnumType, GraphQLInputObjectType } = require('graphql');
const UsersResolver = require('./UsersResolver');

const AdminPagesRights = new GraphQLObjectType({
    name: 'AdminPagesRights',
    fields: () => ({
        analytics: { type: GraphQLBoolean },
        products: { type: GraphQLBoolean },
        orders: { type: GraphQLBoolean },
        pages: { type: GraphQLBoolean },
        users: { type: GraphQLBoolean },
    })
});

const AdminPagesRightsInput = new GraphQLInputObjectType({
    name: 'AdminPagesRightsInput',
    fields: {
        analytics: { type: GraphQLBoolean },
        products: { type: GraphQLBoolean },
        orders: { type: GraphQLBoolean },
        pages: { type: GraphQLBoolean },
        users: { type: GraphQLBoolean },
    }
})

const UserPermissions = new GraphQLObjectType({
    name: 'UserPermissions',
    fields: () => ({
        canSee: { type: AdminPagesRights },
        canEdit: { type: AdminPagesRights },
        canDelete: { type: AdminPagesRights }
    })
})

const UserPermissionsInput = new GraphQLInputObjectType({
    name: 'UserPermissionsInput',
    fields: {
        canSee: { type: AdminPagesRightsInput },
        canEdit: { type: AdminPagesRightsInput },
        canDelete: { type: AdminPagesRightsInput }
    },
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        firstname: { type: GraphQLString },
        lastname: { type: GraphQLString },
        email: { type: GraphQLString },
        permissions: { type: UserPermissions },
        isOnline: { 
            type: GraphQLBoolean,
            resolve: UsersResolver.isOnline
        },
        createdISO: { type: GraphQLString },
        lastModifiedISO: { type: GraphQLString },
        createdBy: {
            type: UserType,
            resolve: async ({createdById, actionUserId}, args, context) => {
                return createdById && await UsersResolver.get(null, { id: createdById, actionUserId }, context);
            }
        }
    }),
});

module.exports = {
    UserType,
    AdminPagesRights,
    UserPermissions,
    AdminPagesRightsInput,
    UserPermissionsInput,
};