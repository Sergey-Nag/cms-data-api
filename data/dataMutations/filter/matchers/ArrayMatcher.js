const Matcher = require("./Matcher");

class ArrayMatcher extends Matcher {
    constructor(propertyName, expectedValue, isPartialy = true) {
        super(propertyName, expectedValue);
        this.isPartialy = isPartialy;
    }

    isMatched(item) {
        const value = this.getItemValue(item);
        // Mathes only strings in array
        // TODO: If needs, extend to map all items and create its own matcher to compare values
        return this.expectedValue.every((val, i) => val === value[i]);
    }
}

module.exports = ArrayMatcher;