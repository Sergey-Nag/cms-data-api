const ObjectMatcher = require("./matchers/ObjectMatcher");

class DataFinder {
    constructor(filterCriteria, isPartialy = false) {
        this.dataMatcher = new ObjectMatcher(null, filterCriteria, isPartialy);
    }

    find(data) {
        return data.find((item) => this.dataMatcher.isMatched(item));
    }
}

module.exports = DataFinder;