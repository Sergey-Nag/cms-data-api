const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLEnumType, GraphQLFloat } = require("graphql")

const OrderProductType = new GraphQLObjectType({
    name: 'OrderProduct',
    fields: {
        product: { 
            type: GraphQLString,
            // resolve TODO: product resolver here
        },
        fixedPrice: { type: GraphQLFloat },
        amount: { type: GraphQLInt }
    }
})

const OrderStatusEnum = new GraphQLEnumType({
    name: 'OrderStatus',
    values: {
        NEW: { value: 0 },
        VERIFIED: { value: 1 },
        PACKED: { value: 2 },
        SHIPPED: { value: 3 },
        DELIVERED: { value: 4 },
        CANCELED: { value: 5 },
        RETURNED: { value: 6 },
    },
})

module.exports = {
    OrderProductType,
    OrderStatusEnum,
}