const { PAGES_REPO_NAME } = require('../../constants/repositoryNames');
const Page = require('../../data/models/pages/Page');
const Repository = require('../../data/repositories/Repository');
const PageValidatior = require('../../data/validators/PageValidator');
const DataResolver = require('../DataResolver');

class PagesResolver extends DataResolver {
    static instance = null;
    constructor() {
        if (PagesResolver.instance) {
            return PagesResolver.instance;
        }

        super(new Repository(PAGES_REPO_NAME), Page, PageValidatior);

        PagesResolver.instance = this;
    }
}

module.exports = PagesResolver;
