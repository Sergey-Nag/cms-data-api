const ObjectMatcher = require("./matchers/ObjectMatcher");

class DataFilter {
    constructor(filterCriteria, isPartialy = false) {
        this.dataMatcher = new ObjectMatcher(null, filterCriteria, isPartialy);
    }

    filter(data) {
        return data.filter((item) => this.dataMatcher.isMatched(item));
    }
}

module.exports = DataFilter;