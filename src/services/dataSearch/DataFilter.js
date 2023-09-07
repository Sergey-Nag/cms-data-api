const OptionsMatcher = require("./OptionsMatcher");

module.exports = class DataFilter {
    constructor(options) {
        this.matcher = new OptionsMatcher(null, options);
    }

    find(data) {
        return data.filter((item) => this.matcher.isMatched(item));
    }
}
