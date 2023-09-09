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
            users: false,
            orders: false,
            ...oldUser?.permissions?.canSee,
            ...expectedUser?.permissions?.canSee,
        },
        canEdit: {
            analytics: false,
            products: false,
            pages: false,
            users: false,
            orders: false,
            ...oldUser?.permissions?.canEdit,
            ...expectedUser?.permissions?.canEdit,
        },
        canDelete: {
            analytics: false,
            products: false,
            pages: false,
            users: false,
            orders: false,
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

    
    !isUndefined(id) && expect(responsePage).toHaveProperty('id', id);
    !isUndefined(path) && expect(responsePage).toHaveProperty('path', path);
    !isUndefined(alias) && expect(responsePage).toHaveProperty('alias', alias);
    !isUndefined(title) && expect(responsePage).toHaveProperty('title', title);
    !isUndefined(createdISO) && expect(responsePage).toHaveProperty('createdISO', createdISO);
    !isUndefined(lastModifiedISO) && expect(responsePage).toHaveProperty('lastModifiedISO', lastModifiedISO);
    !isUndefined(createdById) && expect(responsePage).toHaveProperty('createdBy', {
        id: createdById
    });
    !isUndefined(modifiedById) && expect(responsePage).toHaveProperty('modifiedBy', {
        id: modifiedById
    });
}

module.exports = {
    expectUserData,
    expectPageData,
}