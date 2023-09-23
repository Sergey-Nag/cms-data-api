const { GraphQLString, GraphQLNonNull, GraphQLList, GraphQLInputObjectType, GraphQLID } = require('graphql');
const {PageType} = require('./type');
const PagesResolver = require('./PagesResolver');
const { authProtect } = require('../utils');
const { addPageProtect, editPageProtect } = require('./mutationProtection');
const { NewPageInput, EditPageInput } = require('./mutationArgs');


const pagesResolver = new PagesResolver();

/** @type {import('graphql/type/definition').GraphQLFieldConfigMap} */
module.exports = {
    editPage: {
        type: PageType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
            input: {
                type: new GraphQLNonNull(EditPageInput),
            }
        },
        resolve: pagesResolver.edit.bind(pagesResolver),
        // resolve: authProtect(editPageProtect(PagesResolver.edit)),
    },
    addPage: {
        type: PageType,
        args: {
            input: {
                type: GraphQLNonNull(NewPageInput)
            },
        },
        resolve: pagesResolver.add.bind(pagesResolver)
        // resolve: authProtect(addPageProtect(PagesResolver.add)),
    },
    deletePage: {
        type: PageType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: pagesResolver.delete.bind(pagesResolver)
        // resolve: authProtect(PagesResolver.delete)
    }
}