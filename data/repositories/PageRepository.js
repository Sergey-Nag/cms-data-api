const Page = require('../models/pages/Page');
const IRepository = require('./Repository');

class PageRepository extends IRepository {
    constructor() {
        super('pages');
    }
    
    add(data, actionUserId) {
        const newPage = new Page(data, actionUserId);
        return super.add(newPage);
    }

    edit(id, data, actionUserId) {
        const page = this.get({id});
        if (!page) return false;

        const updatedPage = new Page(page);
        updatedPage.update(data, actionUserId);
        return super.edit(id, updatedPage);
    }
}

module.exports = PageRepository;
