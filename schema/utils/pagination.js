const { GraphQLInputObjectType, GraphQLNonNull, GraphQLInt } = require("graphql");

const PaginationInput = new GraphQLInputObjectType({
    name: 'Pagination',
    fields: {
        start: { type: new GraphQLNonNull(GraphQLInt) },
        amount: { type: GraphQLInt }
    }
});

module.exports = {
    PaginationInput
}