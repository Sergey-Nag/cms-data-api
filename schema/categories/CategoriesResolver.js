const { CATEGORIES_REPO_NAME } = require("../../constants/repositoryNames");
const Category = require("../../data/models/categories/Category");
const Repository = require("../../data/repositories/Repository");
const CategoryValidator = require("../../data/validators/CategoryValidator");
const DataResolver = require("../DataResolver");

class CategoriesResolver extends DataResolver {
    static instance = null;
    constructor() {
        if (CategoriesResolver.instance) {
            return CategoriesResolver.instance;
        }

        super(new Repository(CATEGORIES_REPO_NAME), Category, CategoryValidator);

        CategoriesResolver.instance = this;
    }
}

module.exports = CategoriesResolver;