const { GraphQLObjectType, GraphQLString, GraphQLList } = require('graphql');
const {UserType} = require('../user/type');
const UsersResolver = require('../user/UsersResolver');

const PageType = new GraphQLObjectType({
    name: 'Page',
    fields: () => ({
        id: { type: GraphQLString },
        path: { type: new GraphQLList(GraphQLString) },
        alias: { type: GraphQLString },
        title: { type: GraphQLString },
        createdISO: { type: GraphQLString },
        createdBy: {
            type: UserType,
            resolve: async ({ createdById, actionUserId }, args, context) => {
                return createdById && UsersResolver.get(null, { id: createdById, actionUserId }, context);
            }
        },
        modifiedBy: {
            type: UserType,
            resolve: async ({ modifiedById, actionUserId }, args, context) => {
                return modifiedById &&  UsersResolver.get(null, { id: modifiedById, actionUserId }, context);
            }
        },
        lastModifiedISO: { type: GraphQLString },
        content: { type: new GraphQLList(GraphQLString) }
    }),
});

module.exports = {PageType};