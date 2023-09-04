const MatchByObjectOptions = require("./MatchByObjectOptions");

class DataFilter {
    constructor(options) {
        this.matcher = new MatchByObjectOptions(null, options);
    }

    find(data) {
        return data.filter((item) => this.matcher.isMatched(item));
    }
}

module.exports = DataFilter;
