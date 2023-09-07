const kebabCase = require("lodash/kebabCase");
const BaseDataModel = require("./base/BaseDataModel");

module.exports = class Page extends BaseDataModel {
    #actionUserId = null;
    constructor({ id, path, alias, title, createdISO, createdById, modifiedById, lastModifiedISO, contentId }, actionUserId) {
        super(id, 'P');
        this.#actionUserId = actionUserId;
        this.createdISO = createdISO ?? new Date().toISOString();

        this.path = path ?? null;
        this.alias = alias ?? kebabCase(title);
        this.title = title;
        this.lastModifiedISO = lastModifiedISO ?? null;
        this.createdById = createdById ?? actionUserId ?? null;
        this.modifiedById = modifiedById ?? null;
        this.contentId = contentId ?? null;

    }

    update({ path, alias, title }) {
        this.path = path ?? this.path;
        this.alias = alias ?? this.alias;
        this.title = title ?? this.title;
        this.lastModifiedISO = new Date().toISOString();
        this.modifiedById = this.#actionUserId;
    }
}