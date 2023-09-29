const { GraphQLObjectType, GraphQLSchema } = require('graphql');
const { userQueryFields, userMutationFields } = require('./user');
const { pageQueryFields, pageMutationFields } = require('./page');
const { ordersQueryFields, ordersMutationFields } = require('./orders');
const { productsQueryFields, productsMutationFields } = require('./products');
const { categoriesQueryFields, categoriesMutationFields } = require('./categories');

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        ...pageQueryFields,
        ...userQueryFields,
        ...ordersQueryFields,
        ...productsQueryFields,
        ...categoriesQueryFields,
    },
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        ...pageMutationFields,
        ...userMutationFields,
        ...ordersMutationFields,
        ...productsMutationFields,
        ...categoriesMutationFields,
    },
});

module.exports = new GraphQLSchema({
    query: Query,
    mutation: Mutation,
});
