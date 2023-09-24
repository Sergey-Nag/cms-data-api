const { GraphQLString, GraphQLNonNull, GraphQLID } = require('graphql');
const { AdminType } = require('./type');
const { authProtect, canEditProtect, canDeleteProtect } = require('../utils');
const { addUserProtect, editUserProtect, addAdminProtect, editAdminProtect } = require('./mutationProtections');
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
        resolve: authProtect(
            canEditProtect(
                'admins',
                addAdminProtect(
                    adminsResolver.add.bind(adminsResolver)
                )
            )
        ) 
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
        resolve: authProtect(
            canEditProtect(
                'admins',
                editAdminProtect(
                    adminsResolver.edit.bind(adminsResolver)
                )
            )
        )
        // resolve: authProtect(editUserProtect(UserResolver.edit)),
    },
    deleteAdmin: {
        type: AdminType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: authProtect(
            canDeleteProtect(
                'admins',
                adminsResolver.delete.bind(adminsResolver)
            )
        )
        // resolve: authProtect(UserResolver.delete),
    }
}
