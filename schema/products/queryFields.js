const { PaginatedProductsType, productsArgs } = require('./queryArgs');
const { ProductType } = require('./type');
const ProductsResolver = require('./ProductsResolver');

const productsResolver = new ProductsResolver();
/** @type {import('graphql/type/definition').GraphQLFieldConfigMap} */
module.exports = {
    product: {
        type: ProductType,
        args: {
            find: productsArgs.filter,
        },
        resolve: productsResolver.get.bind(productsResolver)
    },
    products: {
        args: productsArgs,
        type: PaginatedProductsType,
        resolve: productsResolver.getAll.bind(productsResolver)
    }
};
