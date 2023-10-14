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
            case "&&":
                return this.parsedValue.value.every(({ operator, value }) => {
                    return this.#compare(operator, value, actualValue);
                });
            default:
                return this.#compare(this.parsedValue.operator, this.parsedValue.value, actualValue);
        }
    }

    #compare(operator, expectedValue, actualValue) {
        switch(operator) {
            case "<":
                return actualValue < expectedValue;
            case ">":
                return actualValue > expectedValue;
            case "<=":
                return actualValue <= expectedValue;
            case ">=":
                return actualValue >= expectedValue;
            case "==":
                return actualValue === expectedValue;
            default:
                return actualValue === this.expectedValue;
        }
    }
}

module.exports = NumberMatcher;