const { GraphQLInputObjectType, GraphQLNonNull, GraphQLList, GraphQLString, GraphQLID, GraphQLInt } = require("graphql");
const { NewCustomerInput } = require("../user/mutationArgs");
const { OrderStatusEnum } = require("./type");

const OrderProduct = new GraphQLInputObjectType({
    name: 'OrderProductInput',
    fields: {
        productId: { type: GraphQLNonNull(GraphQLID) },
        amount: { type: GraphQLNonNull(GraphQLInt) },
    }
})

const NewOrderInput = new GraphQLInputObjectType({
    name: 'NewOrderInput',
    description: 'Create order. To assign existing user to this order provide customerId property, either provide customer property to create a new user',
    fields: {
        orderProducts: { type: GraphQLNonNull(GraphQLList(OrderProduct)) },
        customerId: { type: GraphQLID },
        description: { type: GraphQLString },
        shippingAddress: { type: GraphQLString },
        billingAddress: { type: GraphQLString },
        customer: {
            type: NewCustomerInput,
        }
    },
});

const OrderStatusDetailsInput = new GraphQLInputObjectType({
    name: 'OrderStatusDetailsInput',
    fields: {
        status: { type: OrderStatusEnum },
        description: { type: GraphQLString },
    }
})

const EditHistoryInput = new GraphQLInputObjectType({
    name: 'EditHistoryInput',
    fields: {
        index: { type: GraphQLInt },
        input: { type: OrderStatusDetailsInput }
    }
})

const EditStatusHistory = new GraphQLInputObjectType({
    name: 'EditStatusHistory',
    fields: {
        add: { type: OrderStatusDetailsInput },
        edit: { type: EditHistoryInput },
        removeByIndexes: { type: GraphQLList(GraphQLInt) }
    }
})

const EditOrderInput = new GraphQLInputObjectType({
    name: 'EditOrderInput',
    fields: {
        orderProductsId: { type: GraphQLList(GraphQLString) },
        customerId: { type: GraphQLID },
        description: { type: GraphQLString },
        shippingAddress: { type: GraphQLString },
        billingAddress: { type: GraphQLString },
        editStatus: { type: EditStatusHistory }
    },
});

module.exports = {
    NewOrderInput,
    EditOrderInput,
}