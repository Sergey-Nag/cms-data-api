const { GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLList, graphqlSync } = require("graphql");
const { UserPermissionsInput } = require("./queryArgs");

const userEditableFields = {
    firstname: { type: GraphQLString },
    lastname: { type: GraphQLString },
    email: { type: GraphQLString },
}

const adminEditableFields = {
    ...userEditableFields,
    permissions: { type: UserPermissionsInput },
}

const EditAdminInput = new GraphQLInputObjectType({
    name: 'EditAdminInput',
    fields: adminEditableFields,
});
const EditCustomerInput = new GraphQLInputObjectType({
    name: 'EditCustomerInput',
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

const NewCustomerInput = new GraphQLInputObjectType({
    name: 'NewCustomerInput',
    fields: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        firstname: { type: GraphQLString },
        lastname: { type: GraphQLString },
    },
});

module.exports = {
    EditAdminInput,
    NewAdminInput,
    NewCustomerInput,
    EditCustomerInput
}
