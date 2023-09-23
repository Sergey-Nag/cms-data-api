const { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } = require("graphql");
const { UserPermissionsInput } = require("./queryArgs");

const userEditableFields = {
    firstname: { type: GraphQLString },
    lastname: { type: GraphQLString },
    email: { type: GraphQLString },
    permissions: { type: UserPermissionsInput },
}

const EditAdminInput = new GraphQLInputObjectType({
    name: 'EditAdminInput',
    fields: userEditableFields,
});

const NewAdminInput = new GraphQLInputObjectType({
    name: 'NewAdminInput',
    fields: {
        firstname: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        lastname: { type: GraphQLString },
        permissions: { type: UserPermissionsInput },
    },
});

module.exports = {
    EditAdminInput,
    NewAdminInput
}
