const { GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLID, GraphQLInputObjectType } = require("graphql");
const CreatableModelInterface = require("../interfaces/CreatableModelInteface");
const AdminsResolver = require("../user/AdminsResolver");
const { AdminType } = require("../user/type");

const adminsResolver = new AdminsResolver();

const ImageContentType = new GraphQLObjectType({
    name: 'ImageContent',
    interfaces: [CreatableModelInterface],
    fields: {
        id: { type: GraphQLNonNull(GraphQLID) },
        url: { type: GraphQLNonNull(GraphQLString) },
        alt: { type: GraphQLString },
        thumbUrl: { type: GraphQLString },
        mediumUrl: { type: GraphQLString },
        deleteUrl: { type: GraphQLString },
        createdISO: { type: GraphQLNonNull(GraphQLString) },
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
    }
});

const ImageContentInputType = new GraphQLInputObjectType({
    name: 'ImageContentInput',
    fields: {
        id: { type: GraphQLNonNull(GraphQLID) },
        url: { type: GraphQLNonNull(GraphQLString) },
        alt: { type: GraphQLString },
        thumbUrl: { type: GraphQLString },
        mediumUrl: { type: GraphQLString },
        deleteUrl: { type: GraphQLString },
    }
})

module.exports = {
    ImageContentType,
    ImageContentInputType
};
