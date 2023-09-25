const NumberParser = require("../parsers/NumberParser");
const Matcher = require("./Matcher");

class NumberMatcher extends Matcher {
    constructor(propertyName, expectedValue) {
        super(propertyName, expectedValue);
        this.parsedValue = NumberParser.parse(expectedValue);
    }

    isMatched(item) {
        const actualValue = this.getItemValue(item);
        switch (this.parsedValue.operator) {
            case "<":
                return actualValue < this.parsedValue.value;
            case ">":
                return actualValue > this.parsedValue.value;
            case "<=":
                return actualValue <= this.parsedValue.value;
            case ">=":
                return actualValue >= this.parsedValue.value;
            case "==":
                return actualValue === this.parsedValue.value;
            default:
                return actualValue === this.expectedValue;
        }
    }
}

module.exports = NumberMatcher;