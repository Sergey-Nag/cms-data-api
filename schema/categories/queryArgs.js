const { GraphQLObjectType, GraphQLList, GraphQLInt, GraphQLInputObjectType, GraphQLString, GraphQLID } = require("graphql");
const { SortInput } = require("../utils/sort");
const { PaginationInput } = require("../utils/pagination");
const { CategoryType } = require("./type");

const PaginatedCategoriesType = new GraphQLObjectType({
    name: 'PaginatedCategories',
    fields: {
        items: {
            type: GraphQLList(CategoryType)
        },
        end: { type: GraphQLInt },
        itemsLeft: { type: GraphQLInt },
        totalItems: { type: GraphQLInt },
    }
});

const CategoryFilterInput = new GraphQLInputObjectType({
    name: 'CategoryFilter',
    fields: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        alias: { type: GraphQLString },
    }
})

const categoriesArgs = {
    filter: {
        type: CategoryFilterInput,
    },
    sort: {
        type: GraphQLList(SortInput)
    },
    pagination: {
        type: PaginationInput
    }
}

module.exports = {
    PaginatedCategoriesType,
    categoriesArgs,
}