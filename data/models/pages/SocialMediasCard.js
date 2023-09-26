const isUndefined = require("lodash/isUndefined");

class SocialMediasCard {
    constructor({ title, description, imageUrl, url } = {}) {
        this.title = title ?? null;
        this.description = description ?? null;
        this.imageUrl = imageUrl ?? null;
        this.url = url ?? null;
    }

    update({ title, description, imageUrl, url } = {}) {
        this.title = isUndefined(title) ? this.title : title;
        this.description = isUndefined(description) ? this.description : description;
        this.imageUrl = isUndefined(imageUrl) ? this.imageUrl : imageUrl;
        this.url = isUndefined(url) ? this.url : url;
    }
}

module.exports = SocialMediasCard;