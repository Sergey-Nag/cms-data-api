const externalMatchProperties = require("./externalMatchProperties");


class MatchByExternalOption {
    constructor(optionMatchBy, expectedValue) {
        this.option = optionMatchBy;
        this.value = expectedValue;
        this.matchByExternalProp = externalMatchProperties.get(optionMatchBy);
    }

    isMatched(item) {
        return this.matchByExternalProp?.(item) === this.value;
    }
}

module.exports = MatchByExternalOption;
