const { isUndefined } = require("lodash");

function expectUserData(responseUser, expectedUser, oldUser) {
    const id = expectedUser?.id ?? oldUser?.id;
    const firstname = expectedUser?.firstname ?? oldUser?.firstname;
    const lastname = expectedUser?.lastname ?? oldUser?.lastname;
    const email = expectedUser?.email ?? oldUser?.email;
    const createdISO = expectedUser?.createdISO ?? oldUser?.createdISO;
    const lastModifiedISO = expectedUser?.lastModifiedISO ?? oldUser?.lastModifiedISO;
    const createdById = expectedUser?.createdById ?? oldUser?.createdById;

    const permissions = (expectedUser?.permissions || oldUser?.permissions) && {
        canSee: {
            analytics: false,
            products: false,
            pages: false,
            orders: false,
            admins: false,
            customers: false,
            ...oldUser?.permissions?.canSee,
            ...expectedUser?.permissions?.canSee,
        },
        canEdit: {
            analytics: false,
            products: false,
            pages: false,
            orders: false,
            admins: false,
            customers: false,
            ...oldUser?.permissions?.canEdit,
            ...expectedUser?.permissions?.canEdit,
        },
        canDelete: {
            analytics: false,
            products: false,
            pages: false,
            orders: false,
            admins: false,
            customers: false,
            ...oldUser?.permissions?.canDelete,
            ...expectedUser?.permissions?.canDelete,
        },
    }

    !isUndefined(id) && responseUser.id && expect(responseUser).toHaveProperty('id', id);
    !isUndefined(firstname) && responseUser.firstname && expect(responseUser).toHaveProperty('firstname', firstname);
    !isUndefined(lastname) && responseUser.lastname && expect(responseUser).toHaveProperty('lastname', lastname);
    !isUndefined(email) && responseUser.email && expect(responseUser).toHaveProperty('email',  email);
    !isUndefined(createdISO) && responseUser.createdISO && expect(responseUser).toHaveProperty('createdISO', createdISO);
    !isUndefined(lastModifiedISO) && responseUser.lastModifiedISO && expect(responseUser).toHaveProperty('lastModifiedISO', lastModifiedISO);
    !isUndefined(permissions) && responseUser.permissions && expect(responseUser).toHaveProperty('permissions', permissions);
    !isUndefined(createdById) && responseUser.createdBy && expect(responseUser).toHaveProperty('createdBy', {
        id: createdById,
    });
}

function expectPageData(responsePage, expectedPage, oldPage) {
    const id = expectedPage?.id ?? oldPage?.id;
    const path = expectedPage?.path ?? oldPage?.path;
    const alias = expectedPage?.alias ?? oldPage?.alias;
    const title = expectedPage?.title ?? oldPage?.title;
    const createdISO = expectedPage?.createdISO ?? oldPage?.createdISO;
    const createdById = expectedPage?.createdById ?? oldPage?.createdById;
    const modifiedById = expectedPage?.modifiedById ?? oldPage?.modifiedById;
    const lastModifiedISO = expectedPage?.lastModifiedISO ?? oldPage?.lastModifiedISO;
    const isPublished = expectedPage?.isPublished ?? oldPage?.isPublished;
    const meta = expectedPage?.meta ?? oldPage?.meta;

    
    !isUndefined(id) && responsePage.id && expect(responsePage).toHaveProperty('id', id);
    !isUndefined(path) && responsePage.path && expect(responsePage).toHaveProperty('path', path);
    !isUndefined(alias) && responsePage.alias && expect(responsePage).toHaveProperty('alias', alias);
    !isUndefined(title) && responsePage.title && expect(responsePage).toHaveProperty('title', title);
    !isUndefined(createdISO) && responsePage.createdISO && expect(responsePage).toHaveProperty('createdISO', createdISO);
    !isUndefined(lastModifiedISO) && responsePage.lastModifiedISO && expect(responsePage).toHaveProperty('lastModifiedISO', lastModifiedISO);
    !isUndefined(createdById) && responsePage.createdBy && expect(responsePage).toHaveProperty('createdBy', {
        id: createdById
    });
    !isUndefined(modifiedById) && responsePage.modifiedBy && expect(responsePage).toHaveProperty('modifiedBy', {
        id: modifiedById
    });
    !isUndefined(isPublished) && responsePage.isPublished && expect(responsePage).toHaveProperty('isPublished', isPublished);
    if (!isUndefined(meta) && responsePage.meta) {
        expect(responsePage.meta).toHaveProperty('keywords', isUndefined(meta.keywords) ? oldPage.meta.keywords : meta.keywords);
        expect(responsePage.meta).toHaveProperty('description', isUndefined(meta.description) ? oldPage.meta.description : meta.description);
        expect(responsePage.meta).toHaveProperty('author', isUndefined(meta.author) ? oldPage.meta.author : meta.author);
        expect(responsePage.meta).toHaveProperty('canonical', isUndefined(meta.canonical) ? oldPage.meta.canonical : meta.canonical);

        if (meta.card && responsePage.meta.card) {
            expect(responsePage.meta.card).toHaveProperty('title', isUndefined(meta.card.title) ? oldPage.meta.card.title : meta.card.title);
            expect(responsePage.meta.card).toHaveProperty('description', isUndefined(meta.card.description) ? oldPage.meta.card.description : meta.card.description);
            expect(responsePage.meta.card).toHaveProperty('imageUrl', isUndefined(meta.card.imageUrl) ? oldPage.meta.card.imageUrl : meta.card.imageUrl);
            expect(responsePage.meta.card).toHaveProperty('url', isUndefined(meta.card.url) ? oldPage.meta.card.url : meta.card.url);
        }
    }
}

module.exports = {
    expectUserData,
    expectPageData,
}