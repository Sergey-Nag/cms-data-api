const { GraphQLObjectType, GraphQLSchema } = require('graphql');
const { userQueryFields, userMutationFields } = require('./user');
const { pageQueryFields, pageMutationFields } = require('./page');
const { ordersQueryFields, ordersMutationFields } = require('./orders');

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        ...pageQueryFields,
        ...userQueryFields,
        ...ordersQueryFields,
    },
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        ...pageMutationFields,
        ...userMutationFields,
        ...ordersMutationFields,
    },
});

module.exports = new GraphQLSchema({
    query: Query,
    mutation: Mutation,
});
