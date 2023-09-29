const { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLID } = require("graphql");
const { PaginatedProductsType, productsArgs } = require("../products/queryArgs");
const ProductsResolver = require("../products/ProductsResolver");

const productsResolver = new ProductsResolver();

const CategoryType = new GraphQLObjectType({
    name: 'Category',
    fields: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLNonNull(GraphQLString) },
        alias: { type: GraphQLString },
        products: { 
            type: PaginatedProductsType,
            args: productsArgs,
            resolve: async ({ id }, args, context) => {
                return await productsResolver.getAll({ categoriesId: [id]}, args, context)
            }
        }
    }
});

module.exports = {
    CategoryType,
}