const { GraphQLObjectType, GraphQLString, GraphQLList } = require('graphql');
const {AdminType} = require('../user/type');
const PagesResolver = require('./PagesResolver');

const PageType = new GraphQLObjectType({
    name: 'Page',
    fields: () => ({
        id: { type: GraphQLString },
        path: { type: new GraphQLList(GraphQLString) },
        alias: { type: GraphQLString },
        title: { type: GraphQLString },
        createdISO: { type: GraphQLString },
        createdBy: {
            type: AdminType,
            resolve: PagesResolver.createdBy
        },
        modifiedBy: {
            type: AdminType,
            resolve: PagesResolver.modifiedBy
        },
        lastModifiedISO: { type: GraphQLString },
        content: { type: new GraphQLList(GraphQLString) }
    }),
});

module.exports = {PageType};