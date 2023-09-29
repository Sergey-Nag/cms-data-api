const { canSeeProtect } = require('../utils');
const CategoriesResolver = require('./CategoriesResolver');
const { categoriesArgs, PaginatedCategoriesType } = require('./queryArgs');
const { CategoryType } = require('./type');

const categoriesResolver = new CategoriesResolver();

/** @type {import('graphql/type/definition').GraphQLFieldConfigMap} */
module.exports = {
    category: {
        type: CategoryType,
        args: {
            find: categoriesArgs.filter,
        },
        resolve: canSeeProtect('products', 
            categoriesResolver.get.bind(categoriesResolver)
        )
    },
    categories: {
        type: PaginatedCategoriesType,
        args: categoriesArgs,
        resolve: canSeeProtect('products', 
            categoriesResolver.getAll.bind(categoriesResolver)
        )
    },
}