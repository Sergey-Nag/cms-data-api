const kebabCase = require('lodash/kebabCase');
const UserEditableModel = require('../baseModels/UserEditableModel');

class Page extends UserEditableModel {
    constructor({ path, alias, title, contentId, ...data }) {
        super(data, 'P');

        this.path = path ?? null;
        this.alias = alias ?? kebabCase(title);
        this.title = title;
        this.contentId = contentId ?? null;
    }

    update({ path, alias, title }, modifiedById = null) {
        this.path = path ?? this.path;
        this.alias = alias ?? this.alias;
        this.title = title ?? this.title;

        super.update(modifiedById);
    }
}

module.exports = Page;
