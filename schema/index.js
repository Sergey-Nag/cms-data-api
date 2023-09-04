const { GraphQLObjectType, GraphQLSchema } = require('graphql');
const { userQueryFields, userMutationFields } = require('./user');
const { pageQueryFields, pageMutationFields } = require('./page');

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        ...pageQueryFields,
        ...userQueryFields,
    },
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        ...pageMutationFields,
        ...userMutationFields,
    },
    
});

module.exports = new GraphQLSchema({
    query: Query,
    mutation: Mutation,
});
