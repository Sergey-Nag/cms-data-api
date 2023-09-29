const kebabCase = require("lodash/kebabCase");
const UniqIdModel = require("../baseModels/UniqIdModel");

class Category extends UniqIdModel {
    constructor({ id, name, alias }) {
        super(id, 'CAT');

        this.name = name;
        this.alias = alias ?? kebabCase(name);
    }
}

module.exports = Category;