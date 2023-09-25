const { GraphQLInterfaceType, GraphQLString, GraphQLID } = require("graphql");

const UserInterface = new GraphQLInterfaceType({
    name: 'User',
    fields: {
        id: { type: GraphQLID },
        firstname: { type: GraphQLString },
        lastname: { type: GraphQLString },
        email: { type: GraphQLString }
    }
});

module.exports = UserInterface;