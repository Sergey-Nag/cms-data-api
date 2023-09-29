const { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } = require("graphql");

const EditCategoryInput = new GraphQLInputObjectType({
    name: 'EditCategoryInput',
    fields: {
        name: { type: GraphQLString },
        alias: { type: GraphQLString },
    }
});

const NewCategoryInput = new GraphQLInputObjectType({
    name: 'NewCategoryInput',
    fields: {
        name: { type: GraphQLNonNull(GraphQLString) },
        alias: { type: GraphQLString },
    }
});

module.exports = {
    NewCategoryInput,
    EditCategoryInput
}