const { GraphQLEnumType, GraphQLInputObjectType, GraphQLString, GraphQLNonNull } = require("graphql");

const SortingOrderEnumType = new GraphQLEnumType({
    name: 'SortingOrder',
    values: {
        ASC: { value: 'ASC' },
        DESC: { value: 'DESC' },
    },
});

const SortInput = new GraphQLInputObjectType({
    name: 'Sort',
    fields: {
        field: {
            type: new GraphQLNonNull(GraphQLString)
        },
        order: {
            type: new GraphQLNonNull(SortingOrderEnumType),
        }
    }
});

module.exports = {
    SortingOrderEnumType,
    SortInput,
}