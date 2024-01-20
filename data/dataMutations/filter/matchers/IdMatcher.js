const Matcher = require("./Matcher");

class IdMatcher extends Matcher {
    constructor(propertyName, expectedValue) {
        super('id', expectedValue);
    }

    isMatched(item) {
        if (Array.isArray(this.expectedValue)) {
            return this.expectedValue.includes(item.id);
        }

        return super.isMatched(item);
    }
}

module.exports = IdMatcher;