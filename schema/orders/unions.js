const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLEnumType, GraphQLFloat, GraphQLList, GraphQLNonNull, GraphQLID } = require("graphql")
const ProductsResolver = require("../products/ProductsResolver");
const CategoriesResolver = require("../categories/CategoriesResolver");
const { ProductCategoryType } = require("../products/sharedTypes");

const productResolver = new ProductsResolver();
const categoriesResolver = new CategoriesResolver();

const OrderProductDetailsType = new GraphQLObjectType({
    name: 'OrderProductDetails',
    fields: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLNonNull(GraphQLString) },
        alias: { type: GraphQLNonNull(GraphQLString) },
        price: { type: GraphQLFloat },
        categories: {
            type: GraphQLList(ProductCategoryType),
            resolve: async ({ categoriesId }, args, context) => {
                return categoriesId &&
                    await categoriesId.map(async (id) => await categoriesResolver.get(null, { find: { id }}, context))
            }
        },
    }
});

const OrderProductType = new GraphQLObjectType({
    name: 'OrderProduct',
    fields: {
        product: { 
            type: OrderProductDetailsType,
            resolve: async ({ productId }) => {
                if (!productId) return;

                try {
                    return await productResolver.get(null, { find: { id: productId }});
                } catch(e) {
                    return null;
                }
            }
            // resolve TODO: product resolver here
        },
        fixedPrice: { type: GraphQLFloat },
        amount: { type: GraphQLInt }
    }
})

const OrderStatusEnum = new GraphQLEnumType({
    name: 'OrderStatus',
    values: {
        NEW: { value: 0 },
        VERIFIED: { value: 1 },
        PACKED: { value: 2 },
        SHIPPED: { value: 3 },
        DELIVERED: { value: 4 },
        CANCELED: { value: 5 },
        RETURNED: { value: 6 },
    },
})

module.exports = {
    OrderProductType,
    OrderStatusEnum,
}