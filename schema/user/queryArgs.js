const { GraphQLInputObjectType, GraphQLString, GraphQLID, GraphQLBoolean, GraphQLList, GraphQLInt, GraphQLObjectType } = require("graphql");
const { DEFAULT_PERMISSIONS } = require("../../constants/defaults");
const { AdminType } = require("./type");

const AdminPagesRightsInput = new GraphQLInputObjectType({
    name: 'AdminPagesRightsInput',
    fields: Object.keys(DEFAULT_PERMISSIONS).reduce((acc, permission) => {
        acc[permission] = {
            type: GraphQLBoolean,
        }
        return acc;
    }, {})
})

const UserPermissionsInput = new GraphQLInputObjectType({
    name: 'UserPermissionsInput',
    fields: {
        canSee: { type: AdminPagesRightsInput },
        canEdit: { type: AdminPagesRightsInput },
        canDelete: { type: AdminPagesRightsInput }
    },
});
const AdminsFilterInput = new GraphQLInputObjectType({
    name: 'AdminsFilter',
    fields: {
        id: { type: GraphQLID },
        firstname: { type: GraphQLString },
        lastname: { type: GraphQLString },
        email: { type: GraphQLString },
        permissions: { type: UserPermissionsInput },
        isOnline: { type: GraphQLBoolean },
        createdISO: { type: GraphQLString },
        lastModifiedISO: { type: GraphQLString },
        createdById: { type: GraphQLString },
        modifiedById: { type: GraphQLString },
    }
});


const PaginatedAdminsType = new GraphQLObjectType({
    name: 'PaginatedAdmins',
    fields: () => ({
        items: {
            type: GraphQLList(AdminType),
        },
        end: { type: GraphQLInt },
        itemsLeft: { type: GraphQLInt },
    })
})

module.exports = {
    AdminPagesRightsInput,
    UserPermissionsInput,
    AdminsFilterInput,
    PaginatedAdminsType
}