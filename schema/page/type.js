const { GraphQLObjectType, GraphQLString, GraphQLList } = require('graphql');
const {UserType} = require('../user/type');
const { getUserResolve } = require('../user/resolvers');
const UserRepository = require('../../data/repositories/UserRepository');

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
            resolve: async ({ createdById, actionUserId }, args) => {
                return createdById && getUserResolve(undefined, { id: createdById, actionUserId });
            }
        },
        modifiedBy: {
            type: UserType,
            resolve: async ({ modifiedById, actionUserId }, args) => {
                return modifiedById && getUserResolve(undefined, { id: modifiedById, actionUserId });
            }
        },
        lastModifiedISO: { type: GraphQLString },
        content: { type: new GraphQLList(GraphQLString) }
    }),
});

module.exports = {PageType};