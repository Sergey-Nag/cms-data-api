const { GraphQLInterfaceType, GraphQLString, GraphQLID } = require("graphql");
const UserInterface = require("./UserInterface");

const EditableModelInterface = new GraphQLInterfaceType({
    name: 'EditableModel',
    description: 'The model contains fields that show which user and when created and edited the model. The `createdBy` and `modifiedBy` fields show user that made a request.',
    fields: {
        createdBy: { type: UserInterface },
        modifiedBy: { type: UserInterface },
        createdISO: { type: GraphQLString },
        lastModifiedISO: { type: GraphQLString }
    }
});

module.exports = EditableModelInterface;