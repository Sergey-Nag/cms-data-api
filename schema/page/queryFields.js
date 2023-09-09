const { GraphQLString, GraphQLList } = require('graphql');
const { PageType } = require('./type');
const PagesResolver = require('./PagesResolver');

const quertyFields = {
    id: { type: GraphQLString },
    path: { type: new GraphQLList(GraphQLString) },
    alias: { type: GraphQLString },
    title: { type: GraphQLString },
    createdISO: { type: GraphQLString },
    createdById: { type: GraphQLString },
    modifiedBy: {type: GraphQLString },
    lastModifiedISO: { type: GraphQLString },
}

/** @type {import('graphql/type/definition').GraphQLFieldConfigMap} */
module.exports = {
    page: {
        type: PageType,
        args: quertyFields,
        resolve: PagesResolver.get,
    },
    pages: {
        type: new GraphQLList(PageType),
        args: quertyFields,
        resolve: PagesResolver.getAll,
    },
};
