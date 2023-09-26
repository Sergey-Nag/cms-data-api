const { GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLList, GraphQLBoolean } = require("graphql");


const SocialMediasCardInput = new GraphQLInputObjectType({
    name: 'SocialMediasCardInput',
    fields: {
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        imageUrl: { type: GraphQLString },
        url: { type: GraphQLString },
    }
})

const PageMetaDataInput = new GraphQLInputObjectType({
    name: 'PageMetaDataInput',
    fields: {
        keywords: { type: GraphQLString },
        description: { type: GraphQLString },
        author: { type: GraphQLString },
        canonical: { type: GraphQLString },
        card: { type: SocialMediasCardInput }
    }
})

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
        isPublished: { type: GraphQLBoolean },
        meta: { type: PageMetaDataInput }
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
        isPublished: { type: GraphQLBoolean },
        meta: { type: PageMetaDataInput }
    },
});

module.exports = {
    NewPageInput,
    EditPageInput,
    PageMetaDataInput
}