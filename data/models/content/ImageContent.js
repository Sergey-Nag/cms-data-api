const CreatableModel = require("../baseModels/CreatableModel");

class ImageContent extends CreatableModel {
    constructor({
        id, 
        url = null,
        alt = null,
        thumbUrl = null,
        mediumUrl = null,
        sizes = null,
        deleteUrl = null,
        ...data
    }) {
        super(data);

        this.id = id;
        this.url = url;
        this.thumbUrl = thumbUrl;
        this.mediumUrl = mediumUrl;
        this.deleteUrl = deleteUrl;
        this.alt = alt;
    }
}

module.exports = ImageContent;