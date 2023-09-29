const { GraphQLID, GraphQLNonNull } = require('graphql');
const { canEditProtect, canDeleteProtect } = require('../utils');
const OrdersResolver = require('./OrdersResolver');
const { NewOrderInput, EditOrderInput } = require('./mutationArgs');
const { OrderType } = require('./type');
const { editOrderProtection } = require('./mutationProtection');

const ordersResolver = new OrdersResolver();

/** @type {import('graphql/type/definition').GraphQLFieldConfigMap} */
module.exports = {
    addOrder: {
        type: OrderType,
        args: {
            input: { type: NewOrderInput }
        },
        resolve: canEditProtect('orders', ordersResolver.add.bind(ordersResolver))
    },
    editOrder: {
        type: OrderType,
        args: {
            id: { type: GraphQLNonNull(GraphQLID) },
            input: { type: GraphQLNonNull(EditOrderInput) }
        },
        resolve: canEditProtect('orders', 
            ordersResolver.edit.bind(ordersResolver)
        )
    },
    deleteOrder: {
        type: OrderType,
        args: {
            id: { type: GraphQLNonNull(GraphQLID) },
        },
        resolve: canDeleteProtect('orders', 
            ordersResolver.delete.bind(ordersResolver)
        )
    },
}