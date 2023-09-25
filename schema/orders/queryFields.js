const { GraphQLList } = require('graphql');
const { PaginatedOrdersType, OrdersFilterInput } = require('./queryArgs');
const { SortInput } = require('../utils/sort');
const { PaginationInput } = require('../utils/pagination');
const OrdersResolver = require('./OrdersResolver');
const { OrderType } = require('./type');
const { canSeeProtect } = require('../utils');

const queryArgs = {
    filter: {
        type: OrdersFilterInput,
    },
    sort: {
        type: GraphQLList(SortInput)
    },
    pagination: {
        type: PaginationInput
    }
}

const ordersResolver = new OrdersResolver();

/** @type {import('graphql/type/definition').GraphQLFieldConfigMap} */
module.exports = {
    orders: {
        type: PaginatedOrdersType,
        args: queryArgs,
        resolve: canSeeProtect('orders', ordersResolver.getAll.bind(ordersResolver))
    },
    order: {
        type: OrderType,
        args: {
            find: queryArgs.filter,
        },
        resolve: canSeeProtect('orders', ordersResolver.get.bind(ordersResolver))
    }
}