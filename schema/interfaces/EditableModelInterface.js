const { GraphQLInterfaceType, GraphQLString, GraphQLID } = require("graphql");
const UserInterface = require("./UserInterface");

const EditableModelInterface = new GraphQLInterfaceType({
    name: 'EditableModel',
    description: 'The model contains fields that show what user (Admin) and when (ISO time) edited the model.',
    fields: {
        modifiedBy: { type: UserInterface },
        lastModifiedISO: { type: GraphQLString }
    }
});

module.exports = EditableModelInterface;
