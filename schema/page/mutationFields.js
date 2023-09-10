const { GraphQLString, GraphQLNonNull, GraphQLList, GraphQLInputObjectType } = require('graphql');
const {PageType} = require('./type');
const PagesResolver = require('./PagesResolver');
const { authProtect } = require('../utils');
const { addPageProtect, editPageProtect } = require('./mutationProtection');

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
            data: {
                type: new GraphQLNonNull(EditPageInput),
                args: editFields
            }
        },
        resolve: authProtect(editPageProtect(PagesResolver.edit)),
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
        },
        resolve: authProtect(addPageProtect(PagesResolver.add)),
    },
    deletePage: {
        type: PageType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: authProtect(PagesResolver.delete)
    }
}