const { GraphQLNonNull, GraphQLList, GraphQLID } = require('graphql');
const {PageType} = require('./type');
const PagesResolver = require('./PagesResolver');
const { authProtect, canEditProtect, canDeleteProtect } = require('../utils');
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
        resolve: authProtect(
            canEditProtect('pages',
                editPageProtect(
                    pagesResolver.edit.bind(pagesResolver)
                )
            )
        )
    },
    addPage: {
        type: PageType,
        args: {
            input: {
                type: GraphQLNonNull(NewPageInput)
            },
        },
        resolve: authProtect(
            canEditProtect(
                'pages',
                addPageProtect(
                    pagesResolver.add.bind(pagesResolver)
                )
            )
        ) 
    },
    deletePages: {
        type: GraphQLList(PageType),
        args: {
            ids: { type: new GraphQLNonNull(GraphQLList(GraphQLID)) },
        },
        resolve: authProtect(
            canDeleteProtect(
                'pages',
                pagesResolver.delete.bind(pagesResolver)
            )
        )
    }
}