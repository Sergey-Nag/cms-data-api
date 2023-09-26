const isUndefined = require("lodash/isUndefined");
const SocialMediasCard = require("./SocialMediasCard");

class PageMetaData {
    constructor({ keywords, description, author, canonical, card } = {}) {
        this.keywords = keywords ?? null;
        this.description = description ?? null;
        this.author = author ?? null;
        this.canonical = canonical ?? null;
        this.card = new SocialMediasCard(card);
    }

    update({ keywords, description, author, canonical, card } = {}) {
        this.keywords = isUndefined(keywords) ? this.keywords : keywords;
        this.description = isUndefined(description) ? this.description : description;
        this.author = isUndefined(author) ? this.author : author;
        this.canonical = isUndefined(canonical) ? this.canonical : canonical;
        
        if (card) this.card.update(card);
    }
}

module.exports = PageMetaData;