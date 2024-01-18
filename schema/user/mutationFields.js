const { GraphQLString, GraphQLNonNull, GraphQLID, GraphQLList } = require('graphql');
const { AdminType, CustomerType } = require('./type');
const { authProtect, canEditProtect, canDeleteProtect } = require('../utils');
const { addAdminProtect, editAdminProtect, addCustomerProtect, editCustomerProtect } = require('./mutationProtections');
const AdminsResolver = require('./AdminsResolver');
const { NewAdminInput, EditAdminInput, NewCustomerInput, EditCustomerInput } = require('./mutationArgs');
const CustomersResolver = require('./CustomersResolver');

const adminsResolver = new AdminsResolver();
const customersResolver = new CustomersResolver();

/** @type {import('graphql/type/definition').GraphQLFieldConfigMap} */
module.exports = {
    addAdmin: {
        type: AdminType,
        args: {
            input: {
                type: GraphQLNonNull(NewAdminInput)
            },
        },
        resolve: authProtect(
            canEditProtect(
                'admins',
                addAdminProtect(
                    adminsResolver.add.bind(adminsResolver)
                )
            )
        )
    },
    editAdmin: {
        type: AdminType,
        args: {
            id: { type: GraphQLNonNull(GraphQLID) },
            input: {
                type: GraphQLNonNull(EditAdminInput),
            },
        },
        resolve: authProtect(
            canEditProtect(
                'admins',
                editAdminProtect(
                    adminsResolver.edit.bind(adminsResolver)
                )
            )
        )
    },
    deleteAdmins: {
        type: GraphQLList(AdminType),
        args: {
            ids: { type: new GraphQLNonNull(GraphQLList(GraphQLID)) },
        },
        resolve: authProtect(
            canDeleteProtect(
                'admins',
                adminsResolver.delete.bind(adminsResolver)
            )
        )
    },
    addCustomer: {
        type: CustomerType,
        args: {
            input: {
                type: GraphQLNonNull(NewCustomerInput)
            },
        },
        resolve: canEditProtect('customers', 
            addCustomerProtect(
                customersResolver.add.bind(customersResolver)
            )
        )
    },
    editCustomer: {
        type: CustomerType,
        args: {
            id: { type: GraphQLNonNull(GraphQLID) },
            input: {
                type: GraphQLNonNull(EditCustomerInput),
            },
        },
        resolve: canEditProtect('customers', 
            editCustomerProtect(
                customersResolver.edit.bind(customersResolver),
            )
        )
    },
    deleteCustomers: {
        type: GraphQLList(CustomerType),
        args: {
            ids: { type: GraphQLNonNull(GraphQLList(GraphQLID)) },
        },
        resolve: canDeleteProtect('customers', 
            customersResolver.delete.bind(customersResolver),
        )
    }
}
