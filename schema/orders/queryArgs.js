const { GraphQLObjectType, GraphQLInt, GraphQLList, GraphQLInputObjectType, GraphQLID, GraphQLString, GraphQLFloat, GraphQLUnionType } = require("graphql");
const { OrderType, OrderStatusEnum } = require("./type");

const OrdersFilterInput = new GraphQLInputObjectType({
    name: 'OrdersFilter',
    fields: {
        id: { type: GraphQLID },
        description: { type: GraphQLString },
        orderProductsId: { type: GraphQLList(GraphQLString) },
        shippingAddress: { type: GraphQLString },
        billingAddress: { type: GraphQLString },
        totalPrice: { 
            description: 'totalPrice: To filter a range by a number provide the string: `< 100`, where first argument describes an operator to second argument that desribes a number. Supports operators: `<`, `<=`, `>`, `>=`, `==`',
            type: GraphQLString
        },
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
    }
});

module.exports = {
    PaginatedOrdersType,
    OrdersFilterInput
}