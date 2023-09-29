const { GraphQLList, GraphQLInt, GraphQLInputObjectType, GraphQLObjectType, GraphQLID, GraphQLString, GraphQLBoolean } = require("graphql");
const { PageType } = require("./type");
const { PageMetaDataInput } = require("./mutationArgs");

const PagesFilterInput = new GraphQLInputObjectType({
    name: 'PagesFilter',
    fields: {
        id: { type: GraphQLID },
        path: { type: new GraphQLList(GraphQLString) },
        isPublished: { type: GraphQLBoolean },
        alias: { type: GraphQLString },
        title: { type: GraphQLString },
        createdISO: { type: GraphQLString },
        createdById: { type: GraphQLString },
        modifiedById: {type: GraphQLString },
        lastModifiedISO: { type: GraphQLString },
        meta: { type: PageMetaDataInput }
    }
});

const PaginatedPagesType = new GraphQLObjectType({
    name: 'PaginatedPages',
    fields: () => ({
        items: {
            type: GraphQLList(PageType),
        },
        end: { type: GraphQLInt },
        itemsLeft: { type: GraphQLInt },
        totalItems: { type: GraphQLInt },
    })
})

module.exports = {
    PaginatedPagesType,
    PagesFilterInput,
}