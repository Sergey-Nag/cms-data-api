const { PageRepository } = require('../../data/repositories'); 
const PageValidatior = require('../../data/validators/PageValidator');
const UserValidator = require('../../data/validators/UserValidator');
const ApiErrorFactory = require('../../utils/ApiErrorFactory');
const { loadUserById } = require('../utils');

module.exports = class PagesResolver {
    static async getAll(parent, { actionUserId, ...data }, context) {
        const pages = new PageRepository();
        await pages.load();
    
        if (actionUserId) {
            const actionUser = await loadUserById(actionUserId);  
            new UserValidator(actionUser, actionUserId)
                .canSee('pages');
        }
    
        return pages.getAll(data);
    }
    static async get(parent, { actionUserId, ...data }, context) {
        const pages = new PageRepository();
        await pages.load();
    
        if (actionUserId) {
            new UserValidator(await loadUserById(actionUserId))
                .canSee('pages');
        }
    
        const foundPage = pages.get(data);
    
        if (!foundPage) {
            throw ApiErrorFactory.pageNotFound(data.id);
        }
    
        return foundPage;
    }
    static async edit(parent, {id, actionUserId, data}) {
        const pages = new PageRepository();
        await pages.load();
    
        if (actionUserId) {
            new UserValidator(await loadUserById(actionUserId))
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

    static async add(parent, { actionUserId, ...data}) {
        const pages = new PageRepository();
        await pages.load();
    
        if (actionUserId) {
            new UserValidator(await loadUserById(actionUserId))
                .canEdit('pages');
        }
    
        PageValidatior.validateDataToCreate(data);
    
        const addedPage = pages.add(data, actionUserId);
        await pages.save();
        return addedPage;
    }

    static async delete(parent, { id, actionUserId }) {
        const pages = new PageRepository();
        await pages.load();
    
        if (actionUserId) {
            new UserValidator(await loadUserById(actionUserId))
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
}