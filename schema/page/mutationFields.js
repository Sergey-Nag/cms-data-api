const { GraphQLString, GraphQLNonNull, GraphQLList, GraphQLInputObjectType } = require('graphql');
const { editPageResolve, addPageResolve, deletePageResolve } = require('./resolvers');
const {PageType} = require('./type');

const editFields = {
    path: { type: new GraphQLList(GraphQLString) },
    alias: { type: GraphQLString },
    title: { type: GraphQLString },
    // content: { type: new GraphQLList(GraphQLString) }
}

const EditPageInput = new GraphQLInputObjectType({
    name: 'EditPageInput',
    fields: {
        path: { type: new GraphQLList(GraphQLString) },
        alias: { type: GraphQLString },
        title: { type: GraphQLString },
    },
});

/** @type {import('graphql/type/definition').GraphQLFieldConfigMap} */
module.exports = {
    editPage: {
        type: PageType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) },
            actionUserId: { type: new GraphQLNonNull(GraphQLString) },
            data: {
                type: new GraphQLNonNull(EditPageInput),
                args: editFields
            }
        },
        resolve: editPageResolve,
    },
    addPage: {
        type: PageType,
        args: {
            path: { 
                type: new GraphQLNonNull(GraphQLList(GraphQLString))
            },
            title: { type: new GraphQLNonNull(GraphQLString) },
            alias: { 
                type: GraphQLString 
            },
            actionUserId: { type: GraphQLString },
        },
        resolve: addPageResolve,
    },
    deletePage: {
        type: PageType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) },
            actionUserId: { type: GraphQLString },
        },
        resolve: deletePageResolve
    }
}