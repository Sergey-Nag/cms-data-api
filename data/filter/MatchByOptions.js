class MatchByOptions {
    constructor(...matchers) {
        this.matchers = matchers;
    }

    isMatched(item) {
        return this.matchers.every(m => m.isMatched(item));
    }
}

module.exports = MatchByOptions;