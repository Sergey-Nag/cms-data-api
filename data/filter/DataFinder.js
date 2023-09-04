const DataFilter = require("./DataFilter");

class DataFinder extends DataFilter {
    constructor(options) {
        super(options);
    }

    find(data) {
        return data.find((item) => this.matcher.isMatched(item));
    }
}

module.exports = DataFinder;
