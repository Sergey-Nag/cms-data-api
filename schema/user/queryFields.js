const { GraphQLList } = require('graphql');
const { AdminType } = require('./type');
const { authProtect } = require('../utils');
const { AdminsFilterInput, PaginatedAdminsType } = require('./queryArgs');
const { SortInput } = require('../utils/sort');
const AdminsResolver = require('./AdminsResolver');
const { PaginationInput } = require('../utils/pagination');

const queryFields = {
    filter: {
        type: AdminsFilterInput
    },
    sort: {
        type: GraphQLList(SortInput)
    },
    pagination: {
        type: PaginationInput
    }
}

const adminsResolver = new AdminsResolver();

/** @type {import('graphql/type/definition').GraphQLFieldConfigMap} */
module.exports = {
    admins: {
        type: PaginatedAdminsType,
        args: queryFields,
        resolve: adminsResolver.getAll.bind(adminsResolver)
        // resolve: authProtect(UserResolver.getAll)
    },
    admin: {
        type: AdminType,
        args: {
            find: queryFields.filter
        },
        resolve: adminsResolver.get.bind(adminsResolver)
        // resolve: authProtect(UserResolver.get),
    },
};
