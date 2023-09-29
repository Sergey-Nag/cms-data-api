const { GraphQLInterfaceType, GraphQLString, GraphQLID } = require("graphql");
const UserInterface = require("./UserInterface");

const CreatableModelInterface = new GraphQLInterfaceType({
    name: 'CreatableModel',
    description: 'The model contains fields that show what user (Admin) and when (ISO time) created the model.',
    fields: {
        createdBy: { type: UserInterface },
        createdISO: { type: GraphQLString },
    }
});

module.exports = CreatableModelInterface;