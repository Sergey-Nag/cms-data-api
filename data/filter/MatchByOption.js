const isNil = require("lodash/isNil");

class MatchByOption {
    option;
    value;
    isExact;
    constructor(optionMatchBy, expectedValue, isExactMatch = false) {
        this.option = optionMatchBy;
        this.value = expectedValue;
        this.isExact = isNil(this.value) ? true : isExactMatch;
    }

    isMatched(item) {
        return this.isExact
            ? this.#exactMatched(item)
            : this.#particalyMatched(item);
    }

    #exactMatched(item) {
        return item[this.option] === this.value;
    }

    #particalyMatched(item) {
        const value = item[this.option];
        if (typeof value !== 'string') {
            return this.#exactMatched(item);
        }

        return value.toLowerCase().includes(this.value.toLowerCase());
    }
}

module.exports = MatchByOption;