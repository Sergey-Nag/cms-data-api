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

        const updatedPage = new Page(page, actionUserId);
        updatedPage.update(data);
        return super.edit(id, updatedPage);
    }

    // get() {
    //     const pages = super.get(id);
    //     if (!queryOptions) return pages;

    //     const filter = new FilterByOption('title', queryOptions.title);
    //     const filteredPaged = pages.filter(filter.isSatisfied);

    //     return filteredPaged;
    // }
}

module.exports = PageRepository;
