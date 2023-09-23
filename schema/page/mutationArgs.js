const { GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLList } = require("graphql");

const NewPageInput = new GraphQLInputObjectType({
    name: 'NewPageInput',
    fields: {
        path: { 
            type: new GraphQLNonNull(GraphQLList(GraphQLString))
        },
        title: { type: new GraphQLNonNull(GraphQLString) },
        alias: { 
            type: GraphQLString 
        },
    },
});
const EditPageInput = new GraphQLInputObjectType({
    name: 'EditPageInput',
    fields: {
        path: { 
            type: GraphQLList(GraphQLString)
        },
        title: { type: GraphQLString },
        alias: {
            type: GraphQLString 
        },
    },
});

module.exports = {
    NewPageInput,
    EditPageInput
}