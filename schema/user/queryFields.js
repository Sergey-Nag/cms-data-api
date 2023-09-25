const { GraphQLList } = require('graphql');
const { AdminType, CustomerType } = require('./type');
const { authProtect, canSeeProtect } = require('../utils');
const { AdminsFilterInput, PaginatedAdminsType, PaginatedCustomersType, CustomerFilterInput } = require('./queryArgs');
const { SortInput } = require('../utils/sort');
const AdminsResolver = require('./AdminsResolver');
const { PaginationInput } = require('../utils/pagination');
const CustomersResolver = require('./CustomersResolver');

const querySortPaginationFields = {
    sort: {
        type: GraphQLList(SortInput)
    },
    pagination: {
        type: PaginationInput
    }
}

const queryAdminFields = {
    filter: {
        type: AdminsFilterInput
    },
    ...querySortPaginationFields,
}

const queryCustomerFields = {
    filter: {
        type: CustomerFilterInput
    },
    ...querySortPaginationFields,
}

const adminsResolver = new AdminsResolver();
const customersResolver = new CustomersResolver();

/** @type {import('graphql/type/definition').GraphQLFieldConfigMap} */
module.exports = {
    admins: {
        type: PaginatedAdminsType,
        args: queryAdminFields,
        resolve: authProtect(
            canSeeProtect('admins', 
                adminsResolver.getAll.bind(adminsResolver)
            )
        )
        // resolve: authProtect(UserResolver.getAll)
    },
    admin: {
        type: AdminType,
        args: {
            find: queryAdminFields.filter
        },
        resolve: authProtect(
            canSeeProtect('admins', 
                adminsResolver.get.bind(adminsResolver)
            )
        )
    },
    customers: {
        type: PaginatedCustomersType,
        args: queryCustomerFields,
        resolve: canSeeProtect('customers', customersResolver.getAll.bind(customersResolver))
    },
    customer: {
        type: CustomerType,
        args: {
            find: queryCustomerFields.filter,
        },
        resolve: canSeeProtect('customers', customersResolver.get.bind(customersResolver))
    }
};
