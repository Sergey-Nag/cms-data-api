const DataFilter = require("./DataFilter");

module.exports = class DataFinder extends DataFilter {
    constructor(options) {
        super(options);
    }

    find(data) {
        return data.find((item) => this.matcher.isMatched(item));
    }
}
