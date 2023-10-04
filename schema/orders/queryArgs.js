const { GraphQLObjectType, GraphQLInt, GraphQLList, GraphQLInputObjectType, GraphQLID, GraphQLString, GraphQLFloat, GraphQLUnionType } = require("graphql");
const { OrderType, OrderStatusEnum } = require("./type");
const NumberSearchInput = require("../_sharedTypes/NumberSearchInput");

const OrdersFilterInput = new GraphQLInputObjectType({
    name: 'OrdersFilter',
    fields: {
        id: { type: GraphQLID },
        description: { type: GraphQLString },
        orderProductsId: { type: GraphQLList(GraphQLString) },
        shippingAddress: { type: GraphQLString },
        billingAddress: { type: GraphQLString },
        totalPrice: { type: NumberSearchInput },
        customerId: { type: GraphQLID },
        currentStatus: { type: OrderStatusEnum },
        lastModifiedISO: { type: GraphQLString },
        createdISO: { type: GraphQLString },
    }
});

const PaginatedOrdersType = new GraphQLObjectType({
    name: 'PaginatedOrders',
    fields: {
        items: {
            type: GraphQLList(OrderType),
        },
        end: { type: GraphQLInt },
        itemsLeft: { type: GraphQLInt },
        totalItems: { type: GraphQLInt },
    }
});

module.exports = {
    PaginatedOrdersType,
    OrdersFilterInput
}