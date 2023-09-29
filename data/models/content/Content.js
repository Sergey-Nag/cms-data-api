const EditableModel = require("../baseModels/EditableModel");

class Content extends EditableModel {
    constructor({ style, styles, ...data}) {
        super(data, 'CT');
        if (style) {
            this.style = style;
        } else if (styles) {
            this.styles = styles;
        }
    }

    update({ style, styles }, modifiedById) {
        if (style) {
            this.style = style;
        } else if (styles) {
            this.styles = styles;
        }

        super.update(modifiedById);
    }
}

module.exports = Content;