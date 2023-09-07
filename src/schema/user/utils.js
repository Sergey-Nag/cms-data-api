const defaultPagePersossions = {
    analytics: false,
    products: false,
    orders: false,
    pages: false,
    users: false,
}

function setupPermissions(definedPermissions) {
    return {
        canSee: {
            ...defaultPagePersossions,
            ...definedPermissions?.canSee
        },
        canEdit: {
            ...defaultPagePersossions,
            ...definedPermissions?.canEdit,
        },
        canDelete: {
            ...defaultPagePersossions,
            ...definedPermissions?.canDelete,
        }
    };
}

module.exports = {
    setupPermissions
}