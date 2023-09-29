const { GraphQLNonNull, GraphQLID } = require('graphql');
const CategoriesResolver = require('./CategoriesResolver');
const { PaginatedCategoriesType, categoriesArgs } = require('./queryArgs');
const { CategoryType } = require('./type');
const { NewCategoryInput, EditCategoryInput } = require('./mutationArgs');
const { canEditProtect, canDeleteProtect } = require('../utils');

const categoriesResolver = new CategoriesResolver();

/** @type {import('graphql/type/definition').GraphQLFieldConfigMap} */
module.exports = {
    addCategory: {
        type: CategoryType,
        args: {
            input: { type: GraphQLNonNull(NewCategoryInput) }
        },
        resolve: canEditProtect('products', 
            categoriesResolver.add.bind(categoriesResolver)
        )
    },
    editCategory: {
        type: CategoryType,
        args: {
            id: { type: GraphQLNonNull(GraphQLID) },
            input: { type: GraphQLNonNull(EditCategoryInput) }
        },
        resolve: canEditProtect('products', 
            categoriesResolver.edit.bind(categoriesResolver)
        )
    },
    deleteCategory: {
        type: CategoryType,
        args: {
            id: { type: GraphQLNonNull(GraphQLID) },
        },
        resolve: canDeleteProtect('products', 
            categoriesResolver.delete.bind(categoriesResolver)
        )
    }
}