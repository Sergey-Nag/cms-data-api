const Content = require("./Content");

class ImageContent extends Content {
    constructor({ url = null, alt = null, sizes = null, ...data}) {
        super(data);

        this.url = url;
        this.alt = alt;
        this.sizes = sizes ?? null;
    }

    update({ url = this.url, alt = this.alt, sizes = this.sizes, ...data} = {}, modifiedById) {
        this.url = url;
        this.alt = alt;
        this.sizes = sizes;

        super.update(data, modifiedById);
    }
}

module.exports = ImageContent;