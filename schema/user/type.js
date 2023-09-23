const { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLEnumType, GraphQLInputObjectType, GraphQLID } = require('graphql');
const { DEFAULT_PERMISSIONS } = require('../../constants/defaults');
const AdminsResolver = require('./AdminsResolver');

const AdminPagesRights = new GraphQLObjectType({
    name: 'AdminPagesRights',
    fields: Object.keys(DEFAULT_PERMISSIONS).reduce((acc, permission) => {
        acc[permission] = {
            type: GraphQLBoolean,
        }
        return acc;
    }, {})
});

const UserPermissions = new GraphQLObjectType({
    name: 'UserPermissions',
    fields: () => ({
        canSee: { type: AdminPagesRights },
        canEdit: { type: AdminPagesRights },
        canDelete: { type: AdminPagesRights }
    })
})

const adminsResolver = new AdminsResolver();

const AdminType = new GraphQLObjectType({
    name: 'Admin',
    fields: () => ({
        id: { type: GraphQLID },
        firstname: { type: GraphQLString },
        lastname: { type: GraphQLString },
        email: { type: GraphQLString },
        permissions: { type: UserPermissions },
        isOnline: { type: GraphQLBoolean },
        createdISO: { type: GraphQLString },
        lastModifiedISO: { type: GraphQLString },
        createdBy: {
            type: AdminType,
            resolve: async ({ createdById }, args, context) => {
                return createdById && await adminsResolver.get(
                    null, 
                    { 
                        find: { 
                            id: createdById 
                        } 
                    },
                    context
                );
            }
        },
        modifiedBy: {
            type: AdminType,
            resolve: async ({ modifiedById }, args, context) => {
                return modifiedById && await adminsResolver.get(
                    null,
                    {
                        find: {
                            id: modifiedById
                        }
                    }, 
                    context
                );
            }
        },

    }),
});

module.exports = {
    AdminType,
    AdminPagesRights,
    UserPermissions,
};