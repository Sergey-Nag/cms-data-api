const { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLEnumType, GraphQLInputObjectType, GraphQLID, GraphQLList, GraphQLFloat } = require('graphql');
const { DEFAULT_PERMISSIONS } = require('../../constants/defaults');
const AdminsResolver = require('./AdminsResolver');
const OrdersResolver = require('../orders/OrdersResolver');
const { OrderStatusEnum, OrderProductType } = require('../orders/unions');
const { canSeeProtect, getPriceFromProducts, getCurrentStatus } = require('../utils');
const UserInterface = require('../interfaces/UserInterface');
const EditableModelInterface = require('../interfaces/EditableModelInterface');
const CreatableModelInterface = require('../interfaces/CreatableModelInteface');

const AdminPagesRights = new GraphQLObjectType({
    name: 'AdminPagesRights',
    fields: Object.keys(DEFAULT_PERMISSIONS).reduce((acc, permission) => {
        acc[permission] = {
            type: GraphQLBoolean,
        }
        return acc;
    }, {})
});

const UserPermissions = new GraphQLObjectType({
    name: 'UserPermissions',
    fields: () => ({
        canSee: { type: AdminPagesRights },
        canEdit: { type: AdminPagesRights },
        canDelete: { type: AdminPagesRights }
    })
})

const adminsResolver = new AdminsResolver();

const AdminType = new GraphQLObjectType({
    name: 'Admin',
    interfaces: [UserInterface, CreatableModelInterface, EditableModelInterface],
    fields: () => ({
        id: { type: GraphQLID },
        firstname: { type: GraphQLString },
        lastname: { type: GraphQLString },
        email: { type: GraphQLString },
        permissions: { type: UserPermissions },
        isOnline: { type: GraphQLBoolean },
        createdISO: { type: GraphQLString },
        lastModifiedISO: { type: GraphQLString },
        createdBy: {
            type: AdminType,
            resolve: async ({ createdById }, args, context) => {
                return createdById && await adminsResolver.get(
                    null, 
                    { 
                        find: { 
                            id: createdById 
                        } 
                    },
                    context
                );
            }
        },
        modifiedBy: {
            type: AdminType,
            resolve: async ({ modifiedById }, args, context) => {
                return modifiedById && await adminsResolver.get(
                    null,
                    {
                        find: {
                            id: modifiedById
                        }
                    }, 
                    context
                );
            }
        },

    }),
});

const ordersResolver = new OrdersResolver();

const CustomerOrderType = new GraphQLObjectType({
    name: 'CustomerOrder',
    fields: {
        id: { type: GraphQLID },
        description: { type: GraphQLString },
        orderProducts: { type: GraphQLList(OrderProductType) },
        shippingAddress: { type: GraphQLString },
        billingAddress: { type: GraphQLString },
        totalPrice: { 
            type: GraphQLFloat,
            // resolve: ({orderProductsId}) => getPriceFromProducts(orderProductsId)
        },
        currentStatus: { 
            type: OrderStatusEnum,
            // resolve: ({ statusHistory }) => getCurrentStatus(statusHistory)
        },
        createdISO: { type: GraphQLString },
        lastModifiedISO: { type: GraphQLString },
    }
});

const CustomerType = new GraphQLObjectType({
    name: 'Customer',
    interfaces: [UserInterface],
    fields: () => ({
        id: { type: GraphQLID },
        firstname: { type: GraphQLString },
        lastname: { type: GraphQLString },
        email: { type: GraphQLString },
        orders: { 
            type: GraphQLList(CustomerOrderType),
            resolve: canSeeProtect('orders',  async ({ id }) => {
                const result = await ordersResolver.getAll(null, {
                    filter: {
                        customerId: id
                    }
                });
                return result.items
            })
        }
    }),
});

module.exports = {
    AdminType,
    AdminPagesRights,
    UserPermissions,
    CustomerType,
};