const { PageRepository } = require('../../data/repositories'); 
const PageValidatior = require('../../data/validators/PageValidator');
const UserValidator = require('../../data/validators/UserValidator');
const ApiErrorFactory = require('../../utils/ApiErrorFactory');
const { loadUserById } = require('../utils');
/**
 * Get page by id
 * @param {any | undefined} parent 
 * @param {{ id: string }} args 
 * @returns {Promise<Page>}
 */
async function getPageResolve(parent, { actionUserId, ...data }) {
    const pages = new PageRepository();
    await pages.load();

    if (actionUserId) {
        new UserValidator(await loadUserById(actionUserId), actionUserId)
            .canSee('pages');
    }

    const foundPage = pages.get(data);

    if (!foundPage) {
        throw ApiErrorFactory.pageNotFound(data.id);
    }

    return foundPage;
};

/**
 * Get all pages
 * @returns {Promise<Page[]>}
 */
async function getAllPagesResolve(parent = null, { actionUserId, ...queryData } = {}) {
    const pages = new PageRepository();
    await pages.load();

    if (actionUserId) {
        const actionUser = await loadUserById(actionUserId);  
        new UserValidator(actionUser, actionUserId)
            .canSee('pages');
    }

    return pages.getAll(queryData);
};

/**
 * Edit page by id
 * @param {any | undefined} parent 
 * @param {any} args
 * @returns {Promise<Page>}
 */
async function editPageResolve(parent, {id, actionUserId, data}) {
    const pages = new PageRepository();
    await pages.load();

    if (actionUserId) {
        const actionUser = await loadUserById(actionUserId);
        new UserValidator(actionUser, actionUserId)
            .canEdit('users');
    }

    if (!pages.exist(id)) {
        throw ApiErrorFactory.pageNotFound(id);
    }

    PageValidatior.validateDataToEdit(data);

    const updatedPage = pages.edit(id, data, actionUserId);

    if (!updatedPage) {
        throw ApiErrorFactory.somethingWentWrong();
    }

    await pages.save();
    return updatedPage;
};

/**
 * Add new page
 * @param {any | undefined} parent 
 * @param {any} args
 * @returns {Promise<Page>}
 */
async function addPageResolve(parent, { actionUserId, ...data}) {
    const pages = new PageRepository();
    await pages.load();

    if (actionUserId) {
        const actionUser = await loadUserById(actionUserId);
        new UserValidator(actionUser, actionUserId)
            .canEdit('pages');
    }

    PageValidatior.validateDataToCreate(data);

    const addedPage = pages.add(data, actionUserId);
    await pages.save();
    return addedPage;
}

async function deletePageResolve(parent, { id, actionUserId }) {
    const pages = new PageRepository();
    await pages.load();

    if (actionUserId) {
        const actionUser = await loadUserById(actionUserId);
        new UserValidator(actionUser, actionUserId)
            .canDelete('pages');
    }

    if (!pages.exist(id)) {
        throw ApiErrorFactory.pageNotFound(id);
    }

    const deletedPages = pages.delete(id);
    if (!deletedPages) {
        throw ApiErrorFactory.somethingWentWrong();
    }

    await pages.save();
    return deletedPages[0];
}

module.exports = {
    getPageResolve,
    getAllPagesResolve,
    editPageResolve,
    addPageResolve,
    deletePageResolve,
}
// i0cykv6ollrc0z8v
// Ui0cykdasllrcr1bl
