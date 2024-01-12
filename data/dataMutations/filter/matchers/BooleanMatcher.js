const Matcher = require("./Matcher");

class BooleanMatcher extends Matcher {
    constructor(propertyName, expectedValue) {
        super(propertyName, expectedValue);
    }

    isMatched(item) {
        return this.expectedValue
            ? !!this.getItemValue(item)
            : !this.getItemValue(item);
    }
}

module.exports = BooleanMatcher;