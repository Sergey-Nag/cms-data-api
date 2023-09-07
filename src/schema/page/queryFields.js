const { GraphQLString, GraphQLList } = require('graphql');
const { getPageResolve, getAllPagesResolve } = require('./resolvers');
const { PageType } = require('./type');

const quertyFields = {
    id: { type: GraphQLString },
    actionUserId: { type: GraphQLString },
    path: { type: new GraphQLList(GraphQLString) },
    alias: { type: GraphQLString },
    title: { type: GraphQLString },
    createdISO: { type: GraphQLString },
    createdById: { type: GraphQLString },
    modifiedBy: {type: GraphQLString },
    lastModifiedISO: { type: GraphQLString },
}

/** @type {import('graphql/type/definition').GraphQLFieldConfigMap} */
const page = {
    type: PageType,
    args: quertyFields,
    resolve: getPageResolve,
};
const pages = {
    type: new GraphQLList(PageType),
    args: quertyFields,
    resolve: getAllPagesResolve,
};

module.exports = {
    page,
    pages,
}