const kebabCase = require('lodash/kebabCase');
const ModifiableModel = require('../baseModels/ModifiableModel');

class Page extends ModifiableModel {
    constructor({ id, path, alias, title, createdISO, createdById, modifiedById, lastModifiedISO, contentId }, createdByIdInitial) {
        super({
            id, 
            createdISO, 
            createdById: createdByIdInitial ?? createdById, 
            modifiedById, 
            lastModifiedISO
        }, 'P');

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
