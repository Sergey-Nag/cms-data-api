const MatchByObjectOptions = require("./MatchByObjectOptions");

class DataFilter {
    constructor(options, isExact) {
        this.matcher = new MatchByObjectOptions(null, options, isExact);
    }

    find(data) {
        return data.filter((item) => this.matcher.isMatched(item));
    }
}

module.exports = DataFilter;
