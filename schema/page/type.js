const { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLBoolean } = require('graphql');
const {AdminType} = require('../user/type');
const AdminsResolver = require('../user/AdminsResolver');
const { canSeeProtect } = require('../utils');
const EditableModelInterface = require('../interfaces/EditableModelInterface');
const CreatableModelInterface = require('../interfaces/CreatableModelInteface');

const SocialMediasCardType = new GraphQLObjectType({
    name: 'SocialMediasCard',
    fields: {
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        imageUrl: { type: GraphQLString },
        url: { type: GraphQLString },
    }
})

const PageMetaDataType = new GraphQLObjectType({
    name: 'PageMetaData',
    fields: {
        keywords: { type: GraphQLString },
        description: { type: GraphQLString },
        author: { type: GraphQLString },
        canonical: { type: GraphQLString },
        card: { type: SocialMediasCardType }
    }
})

const adminsResolver = new AdminsResolver();

const PageType = new GraphQLObjectType({
    name: 'Page',
    interfaces: [CreatableModelInterface, EditableModelInterface],
    fields: () => ({
        id: { type: GraphQLString },
        path: { type: new GraphQLList(GraphQLString) },
        alias: { type: GraphQLString },
        title: { type: GraphQLString },
        isPublished: { type: GraphQLBoolean },
        meta: { type: PageMetaDataType },
        createdISO: { type: GraphQLString },
        createdBy: {
            type: AdminType,
            resolve: canSeeProtect('admins', async ({ createdById }, args, context) => {
                return createdById && await adminsResolver.get(
                    null, 
                    { 
                        find: { 
                            id: createdById 
                        } 
                    },
                    context
                );
            })
        },
        modifiedBy: {
            type: AdminType,
            resolve: canSeeProtect('admins', async ({ modifiedById }, args, context) => {
                return modifiedById && await adminsResolver.get(
                    null, 
                    { 
                        find: { 
                            id: modifiedById 
                        } 
                    },
                    context
                );
            })
        },
        lastModifiedISO: { type: GraphQLString },
        content: { type: new GraphQLList(GraphQLString) },
    }),
});

module.exports = {PageType};