const { GraphQLObjectType, GraphQLList, GraphQLInt, GraphQLID, GraphQLString, GraphQLFloat, GraphQLInputObjectType, GraphQLBoolean } = require("graphql");
const { ProductType } = require("./type");
const NumberSearchInput = require("../_sharedTypes/NumberSearchInput");
const { SortInput } = require("../utils/sort");
const { PaginationInput } = require("../utils/pagination");
const MixedScalar = require("../_sharedTypes/MixedScalar");

const CharacteristicInput = new GraphQLInputObjectType({
    name: 'CharacteristicInput',
    fields: {
        name: { type: GraphQLString },
        value: { type: MixedScalar },
    }
});

const ProductOptionInput = new GraphQLInputObjectType({
    name: 'ProductOptionInput',
    fields: {
        name: { type: GraphQLString },
        options: { type: GraphQLList(MixedScalar) },
    }
}); 

const StockSearchInput = new GraphQLInputObjectType({
    name: 'StockSearchInput',
    fields: {
        amount: { type: NumberSearchInput },
        lowStockAlert: { type: NumberSearchInput },
    }
});

const ProductFilterInput = new GraphQLInputObjectType({
    name: 'ProductFilter',
    fields: {
        id: { type: GraphQLID },
        ids: { type: GraphQLList(GraphQLID) },
        name: { type: GraphQLString },
        alias: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: NumberSearchInput },
        categoriesId: {
            description: 'Provide ids of categories',
            type: GraphQLList(GraphQLID) 
        },
        tags: { type: GraphQLList(GraphQLString) },
        stock: { type: StockSearchInput },
        isPublished: { type: GraphQLBoolean },
        hasCoverPhoto: { type: GraphQLBoolean },
        hasPhotos: { type: GraphQLBoolean },
        createdISO: { type: GraphQLString },
        createdById: { type: GraphQLID },
        lastModifiedISO: { type: GraphQLString },
        modifiedById: { type: GraphQLID },
        characteristics: { type: GraphQLList(CharacteristicInput) },
        options: { type: GraphQLList(ProductOptionInput) },
        sold: { type: NumberSearchInput },
    }
});

const PaginatedProductsType = new GraphQLObjectType({
    name: 'PaginatedProducts',
    fields: () => ({
        items: {
            type: GraphQLList(ProductType),
        },
        end: { type: GraphQLInt },
        itemsLeft: { type: GraphQLInt },
        totalItems: { type: GraphQLInt },
    })
});

const productsArgs = {
    filter: {
        type: ProductFilterInput,
    },
    sort: {
        type: GraphQLList(SortInput)
    },
    pagination: {
        type: PaginationInput
    }
}

module.exports = {
    PaginatedProductsType,
    ProductFilterInput,
    CharacteristicInput,
    ProductOptionInput,
    productsArgs
}