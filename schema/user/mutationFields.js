const { GraphQLString, GraphQLNonNull, GraphQLID } = require('graphql');
const { AdminType } = require('./type');
const { authProtect } = require('../utils');
const { addUserProtect, editUserProtect } = require('./mutationProtections');
const AdminsResolver = require('./AdminsResolver');
const { NewAdminInput, EditAdminInput } = require('./mutationArgs');

const adminsResolver = new AdminsResolver();

/** @type {import('graphql/type/definition').GraphQLFieldConfigMap} */
module.exports = {
    addAdmin: {
        type: AdminType,
        args: {
            input: {
                type: GraphQLNonNull(NewAdminInput)
            },
        },
        resolve: adminsResolver.add.bind(adminsResolver)
        // resolve: authProtect(addUserProtect(UserResolver.add)),
    },
    editAdmin: {
        type: AdminType,
        args: {
            id: { type: GraphQLNonNull(GraphQLID) },
            input: {
                type: GraphQLNonNull(EditAdminInput),
            },
        },
        resolve: adminsResolver.edit.bind(adminsResolver)
        // resolve: authProtect(editUserProtect(UserResolver.edit)),
    },
    deleteAdmin: {
        type: AdminType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: adminsResolver.delete.bind(adminsResolver)
        // resolve: authProtect(UserResolver.delete),
    }
}
