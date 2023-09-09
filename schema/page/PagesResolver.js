const { PageRepository } = require('../../data/repositories'); 
const PageValidatior = require('../../data/validators/PageValidator');
const UserValidator = require('../../data/validators/UserValidator');
const ApiErrorFactory = require('../../utils/ApiErrorFactory');
const UsersResolver = require('../user/UsersResolver');

module.exports = class PagesResolver {
    static async getAll(parent, { ...data }, { actionUser }) {
        const pages = new PageRepository();
        await pages.load();
    
        if (actionUser) {
            new UserValidator(actionUser)
                .canSee('pages');
        }
    
        return pages.getAll(data);
    }
    static async get(parent, { ...data }, { actionUser }) {
        const pages = new PageRepository();
        await pages.load();
    
        if (actionUser) {
            new UserValidator(actionUser)
                .canSee('pages');
        }
    
        const foundPage = pages.get(data);
    
        if (!foundPage) {
            throw ApiErrorFactory.pageNotFound(data.id);
        }
    
        return foundPage;
    }
    static async edit(parent, {id, data}, { actionUser }) {
        const pages = new PageRepository();
        await pages.load();
    
        new UserValidator(actionUser)
            .canEdit('users');
    
        if (!pages.exist(id)) {
            throw ApiErrorFactory.pageNotFound(id);
        }
    
        PageValidatior.validateDataToEdit(data);
    
        const updatedPage = pages.edit(id, data, actionUser.id);
    
        if (!updatedPage) {
            throw ApiErrorFactory.somethingWentWrong();
        }
    
        await pages.save();
        return updatedPage;
    };

    static async add(parent, data, { actionUser }) {
        const pages = new PageRepository();
        await pages.load();
    
        new UserValidator(actionUser)
            .canEdit('pages');
    
        PageValidatior.validateDataToCreate(data);
    
        const addedPage = pages.add(data, actionUser.id);
        await pages.save();
        return addedPage;
    }

    static async delete(parent, { id }, { actionUser }) {
        const pages = new PageRepository();
        await pages.load();
    
        new UserValidator(actionUser)
            .canDelete('pages');
    
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

    static async createdBy({ createdById }, args, context) {
        return createdById && context.actionUser && UsersResolver.get(null, { id: createdById }, context);
    }

    static async modifiedBy({ modifiedById }, args, context) {
        return modifiedById && context.actionUser && UsersResolver.get(null, { id: modifiedById }, context);
    }
}