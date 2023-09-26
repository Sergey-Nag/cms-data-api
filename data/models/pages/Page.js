const kebabCase = require('lodash/kebabCase');
const PageEditableModel = require('./PageEditableModel');
const PageMetaData = require('./PageMetaData');

class Page extends PageEditableModel {
    constructor({ path, alias, title, contentId, isPublished, meta, ...data }) {
        super(data, 'P');

        this.path = path ?? null;
        this.alias = alias ?? kebabCase(title);
        this.title = title;
        this.isPublished = isPublished ?? false;
        this.contentId = contentId ?? null;
        this.meta = new PageMetaData(meta);
    }

    update({ path, alias, title, isPublished, meta }, modifiedById = null) {
        this.path = path ?? this.path;
        this.alias = alias ?? this.alias;
        this.title = title ?? this.title;
        this.isPublished = isPublished ?? this.isPublished;

        super.update(modifiedById);
        
        if (meta) this.meta.update(meta);
    }
}

module.exports = Page;
