const { GraphQLList, GraphQLInt, GraphQLInputObjectType, GraphQLObjectType, GraphQLID, GraphQLString } = require("graphql");
const { PageType } = require("./type");

const PagesFilterInput = new GraphQLInputObjectType({
    name: 'PagesFilter',
    fields: {
        id: { type: GraphQLID },
        path: { type: new GraphQLList(GraphQLString) },
        alias: { type: GraphQLString },
        title: { type: GraphQLString },
        createdISO: { type: GraphQLString },
        createdById: { type: GraphQLString },
        modifiedById: {type: GraphQLString },
        lastModifiedISO: { type: GraphQLString },
    }
})

const PaginatedPagesType = new GraphQLObjectType({
    name: 'PaginatedPages',
    fields: () => ({
        items: {
            type: GraphQLList(PageType),
        },
        end: { type: GraphQLInt },
        itemsLeft: { type: GraphQLInt },
    })
})

module.exports = {
    PaginatedPagesType,
    PagesFilterInput,
}