const { GraphQLInputObjectType, GraphQLID, GraphQLString, GraphQLFloat, GraphQLList, GraphQLNonNull, GraphQLBoolean, GraphQLInt } = require("graphql");
const { CharacteristicInput, ProductOptionInput } = require("./queryArgs");

const StockInput = new GraphQLInputObjectType({
    name: 'StockInput',
    fields: {
        amount: { type: GraphQLNonNull(GraphQLInt) },
        lowStockAlert: { type: GraphQLInt },
    }
});

const StockEditInput = new GraphQLInputObjectType({
    name: 'StockEditInput',
    fields: {
        amount: { type: GraphQLInt },
        lowStockAlert: { type: GraphQLInt },
    }
});

const EditProductInput = new GraphQLInputObjectType({
    name: 'EditProductInput',
    fields: {
        name: { type: GraphQLString },
        alias: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: GraphQLFloat },
        categoriesId: { type: GraphQLID },
        tags: { type: GraphQLList(GraphQLString) },
        stock: { type: StockEditInput },
        isPublished: { type: GraphQLBoolean },
        coverPhotoUrl: { type: GraphQLString },
        photosUrl: { type: GraphQLList(GraphQLString) },
        characteristics: { type: GraphQLList(CharacteristicInput) },
        options: { type: GraphQLList(ProductOptionInput) }
    }
});

const NewProductInput = new GraphQLInputObjectType({
    name: 'NewProductInput',
    fields: {
        name: { type: GraphQLNonNull(GraphQLString) },
        alias: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: GraphQLFloat },
        categoriesId: { type: GraphQLList(GraphQLID) },
        tags: { type: GraphQLList(GraphQLString) },
        stock: { type: GraphQLNonNull(StockInput) },
        isPublished: { type: GraphQLBoolean },
        coverPhotoUrl: { type: GraphQLString },
        photosUrl: { type: GraphQLList(GraphQLString) },
        characteristics: { type: GraphQLList(CharacteristicInput) },
        options: { type: GraphQLList(ProductOptionInput) }
    }
});

module.exports = {
    NewProductInput,
    EditProductInput
}