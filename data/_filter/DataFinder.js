const DataFilter = require("./DataFilter");

class DataFinder extends DataFilter {
    constructor(options, isExact) {
        super(options, isExact);
    }

    find(data) {
        return data.find((item) => this.matcher.isMatched(item)) ?? null;
    }
}

module.exports = DataFinder;
