const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull } = require("graphql");

const ProductCategoryType = new GraphQLObjectType({
    name: 'ProductCategory',
    fields: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLNonNull(GraphQLString) },
        alias: { type: GraphQLString },
    },
});

module.exports = {
    ProductCategoryType
}