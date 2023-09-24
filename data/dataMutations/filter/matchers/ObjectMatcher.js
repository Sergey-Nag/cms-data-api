const ArrayMatcher = require("./ArrayMatcher");
const Matcher = require("./Matcher");
const NumberMatcher = require("./NumberMatcher");
const StringMatcher = require("./StringMatcher");

class MatcherFactory {
    static createMatcher(propertyName, expectedValue, isPartialy) {
        if (this.isNumericValue(expectedValue)) {
            return new NumberMatcher(propertyName, expectedValue);
        } else if (typeof expectedValue === "string") {
            return new StringMatcher(propertyName, expectedValue, isPartialy);
        } else if (typeof expectedValue === "object" && !Array.isArray(expectedValue) && expectedValue !== null) {
            return new ObjectMatcher(propertyName, expectedValue);
        } else if (Array.isArray(expectedValue)) {
            return new ArrayMatcher(propertyName, expectedValue, isPartialy);
        }
        return new Matcher(propertyName, expectedValue);
    }
    
    static isNumericValue(expectedValue) {
        return typeof expectedValue === "number" ||
            typeof expectedValue === 'string' && /^([<>]=?|==) ?\d+(\.\d+)?$/.test(expectedValue);
    }
}

class ObjectMatcher extends Matcher {
    constructor(key, data, isPartialy = false) {
        super(key, data);
        this.matchers = this.createMatchers(this.expectedValue, isPartialy);
    }

    createMatchers(data, isPartialy) {
        return Object.entries(data).map(([key, value]) => {
            return MatcherFactory.createMatcher(key, value, isPartialy);
        });
    }

    isMatched(item) {
        const itemObject = this.propertyName ? item[this.propertyName] : item;
        return this.matchers.every((matcher) => {
            if (matcher.propertyName in itemObject) {
                return matcher.isMatched(itemObject);
            }
            return false;
        });
    }
}

module.exports = ObjectMatcher;