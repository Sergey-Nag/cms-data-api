const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLBoolean, GraphQLFloat, GraphQLList, GraphQLInt, GraphQLNonNull } = require("graphql");
const EditableModelInterface = require("../interfaces/EditableModelInterface");
const { AdminType } = require("../user/type");
const CreatableModelInterface = require("../interfaces/CreatableModelInteface");
const MixedScalar = require("../_sharedTypes/MixedScalar");
const AdminsResolver = require("../user/AdminsResolver");
const CategoriesResolver = require("../categories/CategoriesResolver");
const { ProductCategoryType } = require("./sharedTypes");
const { getSoldProducts } = require("./utils");

const adminsResolver = new AdminsResolver();

const StockType = new GraphQLObjectType({
    name: 'Stock',
    fields: {
        amount: { type: GraphQLNonNull(GraphQLInt) },
        lowStockAlert: { type: GraphQLNonNull(GraphQLInt) }
    }
});

const ProductOptionType = new GraphQLObjectType({
    name: 'ProductOption',
    fields: {
        name: { type: GraphQLString },
        options: { type: GraphQLList(MixedScalar) }
    }
});

const ProductCharacteristicType = new GraphQLObjectType({
    name: 'ProductCharacteristic',
    fields: {
        name: { type: GraphQLString },
        value: { type: MixedScalar }
    }
});

const categoriesResolver = new CategoriesResolver();

const PriceHistoryType = new GraphQLObjectType({
    name: 'PriceHistory',
    interfaces: [CreatableModelInterface],
    fields: {
        price: { type: GraphQLFloat },
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
        createdISO: { type: GraphQLString },
    }
});

const ProductType = new GraphQLObjectType({
    name: 'Product',
    interfaces: [CreatableModelInterface, EditableModelInterface],
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLNonNull(GraphQLString) },
        alias: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        price: { type: GraphQLNonNull(GraphQLFloat) },
        priceHistory: { type: GraphQLList(PriceHistoryType) },
        categories: { 
            type: GraphQLList(ProductCategoryType),
            resolve: async ({ categoriesId }, args, context) => {
                return categoriesId &&
                    await categoriesId.map(async (id) => await categoriesResolver.get(null, { find: { id }}, context))
            }
        },
        tags: { type: GraphQLList(GraphQLString) },
        stock: { type: GraphQLNonNull(StockType) },
        characteristics: { type: GraphQLList(ProductCharacteristicType) },
        isPublished: { type: GraphQLNonNull(GraphQLBoolean) },
        coverPhotoUrl: { type: GraphQLString },
        photosUrl: { type: GraphQLList(GraphQLString) },
        createdISO: { type: GraphQLNonNull(GraphQLString) },
        options: { type: GraphQLList(ProductOptionType) },
        sold: {
            type: GraphQLNonNull(GraphQLInt),
            resolve: getSoldProducts,
        },
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
        lastModifiedISO: { type: GraphQLString },
    }),
});

module.exports = {
    ProductType,
}