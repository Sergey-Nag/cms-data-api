const { GraphQLString, GraphQLList } = require('graphql');
const { PageType } = require('./type');
const PagesResolver = require('./PagesResolver');
const { PaginatedPagesType, PagesFilterInput } = require('./queryArgs');
const { SortInput } = require('../utils/sort');
const { PaginationInput } = require('../utils/pagination');
const { canSeeProtect } = require('../utils');

const queryFields = {
    filter: {
        type: PagesFilterInput,
    },
    sort: {
        type: GraphQLList(SortInput)
    },
    pagination: {
        type: PaginationInput
    }
}
const pagesResolver = new PagesResolver();

/** @type {import('graphql/type/definition').GraphQLFieldConfigMap} */
module.exports = {
    page: {
        type: PageType,
        args: {
            find: queryFields.filter,
        },
        resolve: canSeeProtect('pages',
            pagesResolver.get.bind(pagesResolver)
        ) 
    },
    pages: {
        type: PaginatedPagesType,
        args: queryFields,
        resolve: canSeeProtect('pages',
            pagesResolver.getAll.bind(pagesResolver)
        )
    },
};
