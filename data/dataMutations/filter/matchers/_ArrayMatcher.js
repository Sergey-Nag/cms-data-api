const Matcher = require("./Matcher");

class ArrayMatcher extends Matcher {
    constructor(propertyName, expectedValue, isPartialy = true) {
        super(propertyName, expectedValue);
        this.isPartialy = isPartialy;
    }

    isMatched(item) {
        const value = this.getItemValue(item);
        if (this.expectedValue.length === 1 && this.expectedValue[0] === '*') {
            return value.length > 0;
        } else if (this.expectedValue.length === 1 && this.expectedValue[0] === '!') {
            return value.length === 0;
        }
        // Mathes only strings in array
        // TODO: If needs, extend to map all items and create its own matcher to compare values
        return this.isPartialy
            ? this.expectedValue.some((val) => value.includes(val))
            : this.expectedValue.every((val, i) => val === value[i]);
    }
}

module.exports = ArrayMatcher;