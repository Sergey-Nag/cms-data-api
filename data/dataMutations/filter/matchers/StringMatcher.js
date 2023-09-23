const Matcher = require("./Matcher");

class StringMatcher extends Matcher {
    constructor(propertyName, expectedValue, isPartialy = false) {
        super(propertyName, expectedValue);
        this.isPartialy = isPartialy;
    }

    isMatched(item) {
        if (this.isPartialy) return this.#particalyMatched(item)

        return super.isMatched(item);
    }

    #particalyMatched(item) {
        const value = this.getItemValue(item);

        return value.toLowerCase().includes(this.expectedValue.toLowerCase());
    }
}

module.exports = StringMatcher;