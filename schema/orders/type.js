const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLList, GraphQLInt, graphqlSync, GraphQLFloat, GraphQLEnumType, GraphQLUnionType } = require("graphql");
const { CustomerType, AdminType } = require("../user/type");
const Admin = require("../../data/models/users/Admin");
const OrdersResolver = require("./OrdersResolver");
const { OrderStatusEnum, OrderProductType } = require("./unions");
const Repository = require("../../data/repositories/Repository");
const { ADMINS_REPO_NAME, CUSTOMERS_REPO_NAME } = require("../../constants/repositoryNames");
const Customer = require("../../data/models/users/Customer");

const OrderStatusCreatedByType = new GraphQLUnionType({
    name: 'OrderStatusCreatedBy',
    types: [AdminType, CustomerType],
    description: 'Returns either the Admin or Customer types. They implement the User interface',
    resolveType: (value) => {
        if (value instanceof Admin) {
            return AdminType
        }
        return CustomerType
    }
})

const OrderStatusDetailsType = new GraphQLObjectType({
    name: 'OrderStatusDetails',
    fields: {
        status: { type: OrderStatusEnum },
        createdISO: { type: GraphQLString },
        lastModifiedISO: { type: GraphQLString },
        description: { type: GraphQLString },
        createdBy: { 
            type: OrderStatusCreatedByType,
            resolve: async ({ createdById }, args) => {
                if (!createdById) return null;
                const isAdmin = createdById.startsWith('A');
                const repo = new Repository(isAdmin ? ADMINS_REPO_NAME : CUSTOMERS_REPO_NAME);

                await repo.load();

                const item = repo.get(({ id }) => id === createdById);
                if (item && isAdmin) {
                    return new Admin(item);
                } else if (item) {
                    return new Customer(item);
                }

                return null;
            }
        }
    }
})

const ordersResolver = new OrdersResolver();

const OrderType = new GraphQLObjectType({
    name: 'Order',
    fields: {
        id: { type: GraphQLID },
        description: { type: GraphQLString },
        orderProducts: { type: GraphQLList(OrderProductType) },
        shippingAddress: { type: GraphQLString },
        billingAddress: { type: GraphQLString },
        totalPrice: { 
            type: GraphQLFloat,
        },
        customer: {
            type: CustomerType,
            resolve: ordersResolver.getCustomer.bind(ordersResolver)
        },
        currentStatus: { 
            type: OrderStatusEnum,
        },
        statusHistory: { type: GraphQLList(OrderStatusDetailsType) },
        lastModifiedISO: { type: GraphQLString },
        createdISO: { type: GraphQLString }
    }
});

module.exports = {
    OrderType,
    OrderStatusEnum,
    OrderStatusDetailsType,
    OrderProductType,
    OrderStatusCreatedByType
}