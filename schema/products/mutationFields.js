const { GraphQLNonNull, GraphQLID, GraphQLList } = require('graphql');
const ProductsResolver = require('./ProductsResolver');
const { NewProductInput, EditProductInput } = require('./mutationArgs');
const { ProductType } = require('./type');
const { authProtect, canEditProtect, canDeleteProtect } = require('../utils');
const { addProductProtect } = require('./productsProtection');

const productsResolver = new ProductsResolver();

/** @type {import('graphql/type/definition').GraphQLFieldConfigMap} */
module.exports = {
    addProduct: {
        type: ProductType,
        args: {
            input: { type: GraphQLNonNull(NewProductInput) }
        },
        resolve: authProtect(
            canEditProtect('products',
                addProductProtect(
                    productsResolver.add.bind(productsResolver)
                )
            )
        )
    },
    editProduct: {
        type: ProductType,
        args: {
            id: { type: GraphQLNonNull(GraphQLID) },
            input: { type: GraphQLNonNull(EditProductInput) }
        },
        resolve: authProtect(
            canEditProtect('products',
                addProductProtect(
                    productsResolver.edit.bind(productsResolver)
                )
            )
        )
    },
    deleteProducts: {
        type: GraphQLList(ProductType),
        args: {
            ids: { type: GraphQLNonNull(GraphQLList(GraphQLID)) },
        },
        resolve:
            authProtect(
                canDeleteProtect('products',
                    productsResolver.delete.bind(productsResolver)
                )
            )
    }
};
