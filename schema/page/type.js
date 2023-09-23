const { GraphQLObjectType, GraphQLString, GraphQLList } = require('graphql');
const {AdminType} = require('../user/type');
const AdminsResolver = require('../user/AdminsResolver');

const adminsResolver = new AdminsResolver();

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
            resolve: async ({ createdById }, args, context) => {
                return createdById && await adminsResolver.get(
                    null, 
                    { 
                        find: { 
                            id: createdById 
                        } 
                    },
                    context
                );
            }
        },
        modifiedBy: {
            type: AdminType,
            resolve: async ({ modifiedById }, args, context) => {
                return modifiedById && await adminsResolver.get(
                    null, 
                    { 
                        find: { 
                            id: modifiedById 
                        } 
                    },
                    context
                );
            }
        },
        lastModifiedISO: { type: GraphQLString },
        content: { type: new GraphQLList(GraphQLString) }
    }),
});

module.exports = {PageType};